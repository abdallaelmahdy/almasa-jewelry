from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import OperationalError
from sqlalchemy import text
from datetime import datetime

from app.api import deps
from app.models.catalog import Product
from app.models.inventory import InventoryItem, InventoryTransaction, ItemStatus, TransactionType
from app.models.audit import AuditLog
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemOut,
    InventoryAdjustmentRequest,
    InventoryTransitionRequest,
    InventoryTransactionOut
)

router = APIRouter()

def _generate_sku(db: Session) -> str:
    """Generate sequential SKU using PostgreSQL sequence"""
    result = db.execute(text("SELECT nextval('inventory_sku_seq')")).scalar()
    return f"ALM-{result:08d}"

def _log_audit(db: Session, user_id: int, action: str, resource_id: str, old_vals: dict, new_vals: dict):
    audit = AuditLog(
        user_id=user_id,
        action_type=action,
        resource_id=resource_id,
        old_values=old_vals,
        new_values=new_vals
    )
    db.add(audit)

@router.get("/", response_model=List[InventoryItemOut])
def list_inventory(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    sku: Optional[str] = None,
    product_id: Optional[int] = None,
    status: Optional[ItemStatus] = None,
    karat: Optional[int] = None,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """List inventory items"""
    query = db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category))
    
    if sku:
        query = query.filter(InventoryItem.sku == sku)
    if product_id:
        query = query.filter(InventoryItem.product_id == product_id)
    if status:
        query = query.filter(InventoryItem.status == status)
    if karat:
        query = query.filter(InventoryItem.karat == karat)
        
    items = query.order_by(InventoryItem.created_at.desc()).offset(skip).limit(limit).all()
    return items

@router.get("/{id}", response_model=InventoryItemOut)
def get_inventory_item(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Get one inventory item"""
    item = db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.get("/sku/{sku}", response_model=InventoryItemOut)
def get_inventory_by_sku(
    *,
    db: Session = Depends(deps.get_db),
    sku: str,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Get physical piece by SKU"""
    item = db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.sku == sku).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.post("/", response_model=InventoryItemOut)
def stock_intake(
    *,
    db: Session = Depends(deps.get_db),
    item_in: InventoryItemCreate,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Stock intake (Admin only)"""
    # Verify product
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")
        
    sku = _generate_sku(db)
    
    item = InventoryItem(
        sku=sku,
        product_id=item_in.product_id,
        weight=item_in.weight,
        karat=item_in.karat,
        manufacturing_fee=item_in.manufacturing_fee,
        cost_basis=item_in.cost_basis,
        status=ItemStatus.AVAILABLE
    )
    db.add(item)
    db.flush() # flush to get item.id generated
    
    # Create transaction
    tx = InventoryTransaction(
        inventory_item_id=item.id,
        transaction_type=TransactionType.STOCK_IN,
        previous_status=None,
        new_status=ItemStatus.AVAILABLE,
        historical_weight=item.weight,
        historical_karat=item.karat,
        historical_cost_basis=item.cost_basis,
        historical_manufacturing_fee=item.manufacturing_fee,
        created_by_id=current_user.id
    )
    db.add(tx)
    
    _log_audit(
        db, current_user.id, "INVENTORY_CREATED", str(item.id), 
        old_vals={}, 
        new_vals={"sku": item.sku, "status": item.status.value, "weight": str(item.weight), "cost_basis": str(item.cost_basis)}
    )
    
    db.commit()
    db.refresh(item)
    
    # Reload with relations for the return model
    item_out = db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.id == item.id).first()
    return item_out


def _transition_item(db: Session, current_user: Any, item_id: str, expected_status: ItemStatus, new_status: ItemStatus, req: InventoryTransitionRequest, tx_type: TransactionType) -> InventoryItem:
    try:
        item = db.query(InventoryItem).with_for_update().filter(InventoryItem.id == item_id).first()
    except OperationalError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Could not acquire lock on inventory item")
        
    if not item:
        db.rollback()
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    if item.status != expected_status:
        db.rollback()
        raise HTTPException(status_code=409, detail=f"Item status is {item.status}, expected {expected_status}")

    prev_status = item.status
    item.status = new_status
    
    if tx_type == TransactionType.UNLOCK:
        if current_user.role != "admin" and item.locked_by_id != current_user.id:
            db.rollback()
            raise HTTPException(status_code=403, detail="Cannot unlock item locked by another user")
        item.locked_by_id = None
        item.locked_at = None
    elif tx_type == TransactionType.LOCK:
        item.locked_by_id = current_user.id
        from sqlalchemy.sql import func
        item.locked_at = func.now()
    
    tx = InventoryTransaction(
        inventory_item_id=item.id,
        transaction_type=tx_type,
        previous_status=prev_status,
        new_status=new_status,
        historical_weight=item.weight,
        historical_karat=item.karat,
        historical_cost_basis=item.cost_basis,
        historical_manufacturing_fee=item.manufacturing_fee,
        reference_type=req.reference_type,
        reference_id=req.reference_id,
        created_by_id=current_user.id
    )
    db.add(tx)
    
    _log_audit(
        db, current_user.id, f"INVENTORY_STATUS_CHANGE_{tx_type.name}", str(item.id),
        old_vals={"status": prev_status.value},
        new_vals={"status": new_status.value, "reason": req.reason}
    )
    
    db.commit()
    return db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.id == item.id).first()


@router.post("/{id}/lock", response_model=InventoryItemOut)
def lock_inventory(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    req: InventoryTransitionRequest,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Lock an AVAILABLE item"""
    return _transition_item(db, current_user, id, ItemStatus.AVAILABLE, ItemStatus.LOCKED, req, TransactionType.LOCK)

@router.post("/{id}/unlock", response_model=InventoryItemOut)
def unlock_inventory(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    req: InventoryTransitionRequest,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Unlock a LOCKED item to AVAILABLE"""
    return _transition_item(db, current_user, id, ItemStatus.LOCKED, ItemStatus.AVAILABLE, req, TransactionType.UNLOCK)

@router.post("/{id}/return", response_model=InventoryItemOut)
def return_inventory(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    req: InventoryTransitionRequest,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Transition SOLD item to RETURNED (prepare state for returning to AVAILABLE)"""
    return _transition_item(db, current_user, id, ItemStatus.SOLD, ItemStatus.RETURNED, req, TransactionType.RETURN)

@router.post("/{id}/adjust", response_model=InventoryItemOut)
def adjust_inventory(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    req: InventoryAdjustmentRequest,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Adjust an inventory item's properties (Admin only)"""
    try:
        item = db.query(InventoryItem).with_for_update().filter(InventoryItem.id == id).first()
    except OperationalError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Could not acquire lock on inventory item")
        
    if not item:
        db.rollback()
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    old_vals = {
        "weight": str(item.weight),
        "karat": item.karat,
        "cost_basis": str(item.cost_basis),
        "manufacturing_fee": str(item.manufacturing_fee)
    }
    new_vals = {"reason": req.reason}
    
    if req.weight is not None:
        item.weight = req.weight
        new_vals["weight"] = str(req.weight)
    if req.karat is not None:
        item.karat = req.karat
        new_vals["karat"] = req.karat
    if req.cost_basis is not None:
        item.cost_basis = req.cost_basis
        new_vals["cost_basis"] = str(req.cost_basis)
    if req.manufacturing_fee is not None:
        item.manufacturing_fee = req.manufacturing_fee
        new_vals["manufacturing_fee"] = str(req.manufacturing_fee)
        
    tx = InventoryTransaction(
        inventory_item_id=item.id,
        transaction_type=TransactionType.ADJUST,
        previous_status=item.status,
        new_status=item.status, # status doesn't change
        historical_weight=item.weight,
        historical_karat=item.karat,
        historical_cost_basis=item.cost_basis,
        historical_manufacturing_fee=item.manufacturing_fee,
        created_by_id=current_user.id
    )
    db.add(tx)
    
    _log_audit(db, current_user.id, "INVENTORY_ADJUSTED", str(item.id), old_vals, new_vals)
    
    db.commit()
    
    return db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.id == item.id).first()


@router.get("/{id}/transactions", response_model=List[InventoryTransactionOut])
def get_item_transactions(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """View transaction history for one physical item"""
    item = db.query(InventoryItem).filter(InventoryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    txs = db.query(InventoryTransaction).filter(InventoryTransaction.inventory_item_id == id).order_by(InventoryTransaction.created_at.asc()).all()
    return txs

@router.get("-transactions", response_model=List[InventoryTransactionOut])
def list_all_transactions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Admin-only historical ledger access"""
    txs = db.query(InventoryTransaction).order_by(InventoryTransaction.created_at.desc()).offset(skip).limit(limit).all()
    return txs
