from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
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
from app.services.inventory import InventoryService

router = APIRouter()

def _generate_sku(db: Session) -> str:
    """Generate sequential SKU using PostgreSQL sequence"""
    result = db.execute(text("SELECT nextval('inventory_sku_seq')")).scalar()
    return f"ALM-{result:08d}"

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
    background_tasks: BackgroundTasks,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Stock intake (Admin only)"""
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
    db.flush() 
    
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
    
    InventoryService._log_audit(
        background_tasks, current_user.id, "INVENTORY_CREATED", str(item.id), 
        old_vals={}, 
        new_vals={"sku": item.sku, "status": item.status.value, "weight": str(item.weight), "cost_basis": str(item.cost_basis)}
    )
    
    db.commit()
    db.refresh(item)
    
    return db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.id == item.id).first()


@router.post("/{id}/lock", response_model=InventoryItemOut)
def lock_inventory(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    req: InventoryTransitionRequest,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Reserve an AVAILABLE item"""
    session_id = req.session_id or "pos_session"
    InventoryService.reserve_item(db, id, session_id, expires_in_minutes=15)
    return db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.id == id).first()

@router.post("/{id}/unlock", response_model=InventoryItemOut)
def unlock_inventory(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    req: InventoryTransitionRequest,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Release a reservation"""
    session_id = req.session_id or "pos_session"
    InventoryService.release_reservation(db, id, session_id)
    return db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.id == id).first()

@router.post("/{id}/return", response_model=InventoryItemOut)
def return_inventory(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    req: InventoryTransitionRequest,
    background_tasks: BackgroundTasks,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Transition SOLD item to RETURNED"""
    item = InventoryService.transition_item(
        db, current_user.id, id, ItemStatus.SOLD, ItemStatus.RETURNED, 
        TransactionType.RETURN, background_tasks, req.reference_type, req.reference_id, req.reason
    )
    db.commit()
    return db.query(InventoryItem).options(joinedload(InventoryItem.product).joinedload(Product.category)).filter(InventoryItem.id == item.id).first()

@router.post("/{id}/adjust", response_model=InventoryItemOut)
def adjust_inventory(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    req: InventoryAdjustmentRequest,
    background_tasks: BackgroundTasks,
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
    
    InventoryService._log_audit(background_tasks, current_user.id, "INVENTORY_ADJUSTED", str(item.id), old_vals, new_vals)
    
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
