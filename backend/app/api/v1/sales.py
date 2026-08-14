from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, Sequence
from sqlalchemy.exc import IntegrityError
from typing import List
from uuid import UUID
from decimal import Decimal
from datetime import datetime

from app.api import deps
from app.models.user import User
from app.models.sales import Sale, Invoice, InvoiceItem, Payment, Refund, Customer
from app.models.inventory import InventoryItem, InventoryTransaction, ItemStatus, TransactionType
from app.models.catalog import GoldPrice
from app.models.audit import AuditLog
from app.schemas.sales import CheckoutRequest, SaleOut, RefundRequest, RefundResponse, RefundOutBase

router = APIRouter()

def _validate_idempotency_payload(existing_sale: Sale, request: CheckoutRequest):
    if existing_sale.customer_id != request.customer_id:
        raise HTTPException(status_code=409, detail="Idempotency key exists with different payload")
    
    existing_item_ids = {str(item.inventory_item_id) for item in existing_sale.invoice.items} if existing_sale.invoice else set()
    request_item_ids = {str(iid) for iid in request.inventory_item_ids}
    if existing_item_ids != request_item_ids:
        raise HTTPException(status_code=409, detail="Idempotency key exists with different payload")
    
    existing_payments = sorted([(p.method, float(p.amount)) for p in existing_sale.payments])
    request_payments = sorted([(p.method, float(p.amount)) for p in request.payments])
    if existing_payments != request_payments:
        raise HTTPException(status_code=409, detail="Idempotency key exists with different payload")

@router.post("/checkout", response_model=SaleOut, status_code=status.HTTP_201_CREATED)
def checkout(
    *,
    db: Session = Depends(deps.get_db),
    request: CheckoutRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    # Idempotency Check
    existing_sale = db.query(Sale).filter(Sale.idempotency_key == request.idempotency_key).first()
    if existing_sale:
        _validate_idempotency_payload(existing_sale, request)
        return existing_sale # 200 OK implicitly
    
    # Verify items
    items = db.query(InventoryItem).filter(InventoryItem.id.in_(request.inventory_item_ids)).with_for_update().all()
    if len(items) != len(request.inventory_item_ids):
        raise HTTPException(status_code=400, detail="One or more inventory items not found")
    
    for item in items:
        if item.status not in (ItemStatus.AVAILABLE, ItemStatus.LOCKED):
            # Check if this was a concurrent identical request that just succeeded
            concurrent_sale = db.query(Sale).filter(Sale.idempotency_key == request.idempotency_key).first()
            if concurrent_sale:
                _validate_idempotency_payload(concurrent_sale, request)
                return concurrent_sale
            raise HTTPException(status_code=409, detail=f"Item {item.sku} is not available for sale")
        if item.status == ItemStatus.LOCKED and item.locked_by_id != current_user.id:
            raise HTTPException(status_code=409, detail=f"Item {item.sku} is locked by another user")

    # Get latest gold prices per karat
    latest_prices_subq = db.query(
        GoldPrice.karat,
        func.max(GoldPrice.effective_from).label('latest_effective')
    ).group_by(GoldPrice.karat).subquery()
    
    active_prices = db.query(GoldPrice).join(
        latest_prices_subq,
        (GoldPrice.karat == latest_prices_subq.c.karat) & 
        (GoldPrice.effective_from == latest_prices_subq.c.latest_effective)
    ).all()
    
    price_map = {p.karat: p.price_per_gram for p in active_prices}
    
    calculated_total = Decimal("0.00")
    invoice_items = []
    
    for item in items:
        if item.karat not in price_map:
            raise HTTPException(status_code=400, detail=f"No active gold price found for {item.karat}k")
        price_per_gram = price_map[item.karat]
        line_total = (item.weight * price_per_gram) + item.manufacturing_fee
        calculated_total += line_total
        
        # Track transitions for ledger
        prev_status = item.status
        item.status = ItemStatus.SOLD
        item.locked_by_id = None
        item.locked_at = None
        
        # Create Ledger Entry
        txn = InventoryTransaction(
            inventory_item_id=item.id,
            transaction_type=TransactionType.SELL,
            previous_status=prev_status,
            new_status=ItemStatus.SOLD,
            historical_weight=item.weight,
            historical_karat=item.karat,
            historical_cost_basis=item.cost_basis,
            historical_manufacturing_fee=item.manufacturing_fee,
            reference_type="SALE",
            created_by_id=current_user.id
        )
        db.add(txn)
        
        invoice_items.append({
            "inventory_item_id": item.id,
            "historical_weight": item.weight,
            "historical_karat": item.karat,
            "historical_gold_price_per_gram": price_per_gram,
            "historical_manufacturing_fee": item.manufacturing_fee,
            "line_total": line_total
        })

    # Validate Payments
    req_payment_total = sum(p.amount for p in request.payments)
    if req_payment_total != calculated_total:
        raise HTTPException(
            status_code=400, 
            detail=f"Payment total ({req_payment_total}) does not match calculated total ({calculated_total})"
        )

    # Create Sale
    sale = Sale(
        customer_id=request.customer_id,
        user_id=current_user.id,
        idempotency_key=request.idempotency_key,
        status="COMPLETED",
        total_amount=calculated_total
    )
    db.add(sale)
    db.flush()
    
    # Update ledger references
    for obj in db.identity_map.values():
        if isinstance(obj, InventoryTransaction) and obj.reference_type == "SALE":
            obj.reference_id = str(sale.id)

    # Payments
    for p in request.payments:
        payment = Payment(
            sale_id=sale.id,
            amount=p.amount,
            method=p.method
        )
        db.add(payment)

    # Invoice
    invoice_num = db.scalar(Sequence("invoice_number_seq"))
    human_invoice_number = f"INV-{datetime.utcnow().year}-{invoice_num:06d}"
    
    invoice = Invoice(
        sale_id=sale.id,
        invoice_number=human_invoice_number
    )
    db.add(invoice)
    db.flush()

    for ii in invoice_items:
        db.add(InvoiceItem(invoice_id=invoice.id, **ii))

    # Audit
    db.add(AuditLog(
        user_id=current_user.id,
        action_type="SALE_COMPLETED",
        resource_id=f"Sale:{sale.id}",
        new_values={"total_amount": str(calculated_total), "items_count": len(items)}
    ))
    
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        if "idempotency_key" in str(e):
            existing_sale = db.query(Sale).filter(Sale.idempotency_key == request.idempotency_key).first()
            if existing_sale:
                _validate_idempotency_payload(existing_sale, request)
                return existing_sale
        raise HTTPException(status_code=409, detail="Database integrity error during checkout")
        
    db.refresh(sale)
    return sale


@router.post("/{sale_id}/refund", response_model=RefundResponse)
def refund_sale(
    sale_id: int,
    request: RefundRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["admin"]))
):
    # Lock Sale
    sale = db.query(Sale).filter(Sale.id == sale_id).with_for_update().first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
        
    if sale.status == "REFUNDED":
        # Idempotent response
        refunds = db.query(Refund).join(Payment).filter(Payment.sale_id == sale.id).all()
        return {"sale": sale, "refunds": refunds}
        
    if sale.status != "COMPLETED":
        raise HTTPException(status_code=409, detail=f"Cannot refund sale in state {sale.status}")

    # Process Refund
    sale.status = "REFUNDED"
    
    # Find all items and lock them
    invoice = db.query(Invoice).filter(Invoice.sale_id == sale.id).first()
    if invoice:
        item_ids = [ii.inventory_item_id for ii in invoice.items]
        inventory_items = db.query(InventoryItem).filter(InventoryItem.id.in_(item_ids)).with_for_update().all()
        
        for item in inventory_items:
            if item.status != ItemStatus.SOLD:
                raise HTTPException(status_code=409, detail=f"Item {item.sku} is not in SOLD state")
                
            prev_status = item.status
            item.status = ItemStatus.RETURNED
            
            # Ledger
            db.add(InventoryTransaction(
                inventory_item_id=item.id,
                transaction_type=TransactionType.RETURN,
                previous_status=prev_status,
                new_status=ItemStatus.RETURNED,
                historical_weight=item.weight,
                historical_karat=item.karat,
                historical_cost_basis=item.cost_basis,
                historical_manufacturing_fee=item.manufacturing_fee,
                reference_type="REFUND",
                reference_id=str(sale.id),
                created_by_id=current_user.id
            ))
            
    # Refunds
    payments = db.query(Payment).filter(Payment.sale_id == sale.id).all()
    created_refunds = []
    for payment in payments:
        refund = Refund(
            payment_id=payment.id,
            amount=payment.amount,
            reason=request.reason
        )
        db.add(refund)
        created_refunds.append(refund)
        
    # Audit
    db.add(AuditLog(
        user_id=current_user.id,
        action_type="SALE_REFUNDED",
        resource_id=f"Sale:{sale.id}",
        new_values={"refunded_amount": str(sale.total_amount), "reason": request.reason}
    ))
    
    db.commit()
    db.refresh(sale)
    return {"sale": sale, "refunds": created_refunds}


@router.get("/", response_model=List[SaleOut])
def list_sales(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    sales = db.query(Sale).order_by(Sale.created_at.desc()).offset(skip).limit(limit).all()
    return sales


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(
    sale_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
