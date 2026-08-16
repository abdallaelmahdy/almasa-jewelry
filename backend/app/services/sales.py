from sqlalchemy.orm import Session
from sqlalchemy import func, Sequence
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from typing import List, Dict, Any
from decimal import Decimal
from datetime import datetime, timezone

from app.models.sales import Sale, Invoice, InvoiceItem, Payment, Refund
from app.models.inventory import InventoryItem, ItemStatus, TransactionType, Reservation
from app.models.catalog import GoldPrice
from app.models.audit import AuditLog
from app.schemas.sales import CheckoutRequest, RefundRequest
from app.services.inventory import InventoryService
from fastapi import BackgroundTasks
from app.services.audit import log_audit_background

class SalesService:
    @staticmethod
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

    @staticmethod
    def checkout(db: Session, request: CheckoutRequest, current_user_id: int, background_tasks: BackgroundTasks, session_id: str = "pos_session") -> Sale:
        # Idempotency Check
        existing_sale = db.query(Sale).filter(Sale.idempotency_key == request.idempotency_key).first()
        if existing_sale:
            SalesService._validate_idempotency_payload(existing_sale, request)
            return existing_sale
            
        items = db.query(InventoryItem).filter(InventoryItem.id.in_(request.inventory_item_ids)).with_for_update().all()
        if len(items) != len(request.inventory_item_ids):
            raise HTTPException(status_code=400, detail="One or more inventory items not found")

        for item in items:
            if item.status != ItemStatus.AVAILABLE:
                # If it's already sold, check if it was sold by this exact idempotency key
                existing_sale = db.query(Sale).filter(Sale.idempotency_key == request.idempotency_key).first()
                if existing_sale:
                    SalesService._validate_idempotency_payload(existing_sale, request)
                    return existing_sale
                raise HTTPException(status_code=409, detail=f"Item {item.sku} is not available for sale")
                
            # Check if reserved by someone else
            res = db.query(Reservation).filter(Reservation.inventory_item_id == item.id).first()
            if res and res.session_id != session_id:
                raise HTTPException(status_code=409, detail=f"Item {item.sku} is reserved by another session")

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
        
        req_payment_total = sum(p.amount for p in request.payments)
        calculated_total = Decimal("0.00")
        invoice_items_data = []
        
        # Pre-calculate totals and validate before transitions
        for item in items:
            if item.karat not in price_map:
                raise HTTPException(status_code=400, detail=f"No active gold price found for {item.karat}k")
            price_per_gram = price_map[item.karat]
            line_total = (item.weight * price_per_gram) + item.manufacturing_fee
            calculated_total += line_total
            
            invoice_items_data.append({
                "inventory_item_id": item.id,
                "historical_weight": item.weight,
                "historical_karat": item.karat,
                "historical_gold_price_per_gram": price_per_gram,
                "historical_manufacturing_fee": item.manufacturing_fee,
                "line_total": line_total
            })

        if req_payment_total != calculated_total:
            raise HTTPException(
                status_code=400, 
                detail=f"Payment total ({req_payment_total}) does not match calculated total ({calculated_total})"
            )
            
        # Create Sale
        sale = Sale(
            customer_id=request.customer_id,
            user_id=current_user_id,
            idempotency_key=request.idempotency_key,
            status="COMPLETED",
            total_amount=calculated_total
        )
        db.add(sale)
        db.flush()
        
        for item in items:
            # Transition to SOLD
            InventoryService.transition_item(
                db=db,
                current_user_id=current_user_id,
                item_id=str(item.id),
                expected_status=ItemStatus.AVAILABLE,
                new_status=ItemStatus.SOLD,
                tx_type=TransactionType.SELL,
                background_tasks=background_tasks,
                reference_type="SALE",
                reference_id=str(sale.id)
            )
            
            # Clear reservation if exists
            res = db.query(Reservation).filter(Reservation.inventory_item_id == item.id).first()
            if res:
                db.delete(res)

        # Payments
        for p in request.payments:
            db.add(Payment(sale_id=sale.id, amount=p.amount, method=p.method))

        # Invoice
        invoice_num = db.scalar(Sequence("invoice_number_seq"))
        human_invoice_number = f"INV-{datetime.now(timezone.utc).year}-{invoice_num:06d}"
        
        invoice = Invoice(sale_id=sale.id, invoice_number=human_invoice_number)
        db.add(invoice)
        db.flush()

        for ii in invoice_items_data:
            db.add(InvoiceItem(invoice_id=invoice.id, **ii))

        # Audit
        background_tasks.add_task(
            log_audit_background,
            user_id=current_user_id,
            action_type="SALE_COMPLETED",
            resource_id=f"Sale:{sale.id}",
            new_values={"total_amount": str(calculated_total), "items_count": len(items)}
        )
        
        try:
            db.commit()
        except IntegrityError as e:
            db.rollback()
            if "idempotency_key" in str(e):
                existing_sale = db.query(Sale).filter(Sale.idempotency_key == request.idempotency_key).first()
                if existing_sale:
                    SalesService._validate_idempotency_payload(existing_sale, request)
                    return existing_sale
            raise HTTPException(status_code=409, detail="Database integrity error during checkout")
            
        db.refresh(sale)
        return sale

    @staticmethod
    def refund_sale(db: Session, sale_id: int, request: RefundRequest, current_user_id: int, background_tasks: BackgroundTasks) -> Dict[str, Any]:
        sale = db.query(Sale).filter(Sale.id == sale_id).with_for_update().first()
        if not sale:
            raise HTTPException(status_code=404, detail="Sale not found")
            
        if sale.status == "REFUNDED":
            refunds = db.query(Refund).join(Payment).filter(Payment.sale_id == sale.id).all()
            return {"sale": sale, "refunds": refunds}
            
        if sale.status != "COMPLETED":
            raise HTTPException(status_code=409, detail=f"Cannot refund sale in state {sale.status}")

        sale.status = "REFUNDED"
        
        invoice = db.query(Invoice).filter(Invoice.sale_id == sale.id).first()
        if invoice:
            for invoice_item in invoice.items:
                # Transition item using explicitly historical values
                item = db.query(InventoryItem).with_for_update().filter(InventoryItem.id == invoice_item.inventory_item_id).first()
                if item:
                    if item.status != ItemStatus.SOLD:
                        raise HTTPException(status_code=409, detail=f"Item {item.sku} is not in SOLD state")
                    
                    InventoryService.transition_item(
                        db=db,
                        current_user_id=current_user_id,
                        item_id=str(item.id),
                        expected_status=ItemStatus.SOLD,
                        new_status=ItemStatus.RETURNED,
                        tx_type=TransactionType.RETURN,
                        background_tasks=background_tasks,
                        reference_type="REFUND",
                        reference_id=str(sale.id),
                        reason=request.reason
                    )
                
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
            
        background_tasks.add_task(
            log_audit_background,
            user_id=current_user_id,
            action_type="SALE_REFUNDED",
            resource_id=f"Sale:{sale.id}",
            new_values={"refunded_amount": str(sale.total_amount), "reason": request.reason}
        )
        
        db.commit()
        db.refresh(sale)
        return {"sale": sale, "refunds": created_refunds}
