from typing import Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError, IntegrityError
from fastapi import HTTPException
import uuid
from datetime import datetime, timedelta, timezone

from app.models.inventory import InventoryItem, InventoryTransaction, ItemStatus, TransactionType, Reservation
from app.models.catalog import Product
from app.models.audit import AuditLog
from fastapi import BackgroundTasks
from app.services.audit import log_audit_background

class InventoryService:
    @staticmethod
    def _log_audit(background_tasks: BackgroundTasks, user_id: int, action: str, resource_id: str, old_vals: dict, new_vals: dict):
        background_tasks.add_task(
            log_audit_background,
            user_id=user_id,
            action_type=action,
            resource_id=resource_id,
            old_values=old_vals,
            new_values=new_vals
        )

    @staticmethod
    def reserve_item(db: Session, item_id: str, session_id: str, expires_in_minutes: int = 15) -> Reservation:
        """Reserve an AVAILABLE item for a specific session"""
        try:
            item = db.query(InventoryItem).with_for_update().filter(InventoryItem.id == item_id).first()
        except OperationalError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Could not acquire lock on inventory item")
            
        if not item:
            db.rollback()
            raise HTTPException(status_code=404, detail="Inventory item not found")
            
        if item.status != ItemStatus.AVAILABLE:
            db.rollback()
            raise HTTPException(status_code=409, detail=f"Item status is {item.status}, expected {ItemStatus.AVAILABLE}")

        # Check if already reserved
        existing_reservation = db.query(Reservation).filter(Reservation.inventory_item_id == item_id).first()
        if existing_reservation:
            db.rollback()
            raise HTTPException(status_code=409, detail="Item is already reserved")

        # Create reservation
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)
        reservation = Reservation(
            inventory_item_id=item.id,
            session_id=session_id,
            expires_at=expires_at
        )
        db.add(reservation)
        
        try:
            db.commit()
            db.refresh(reservation)
            return reservation
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=409, detail="Item is already reserved")

    @staticmethod
    def release_reservation(db: Session, item_id: str, session_id: Optional[str] = None):
        """Release a reservation, optionally ensuring it belongs to the session"""
        query = db.query(Reservation).filter(Reservation.inventory_item_id == item_id)
        if session_id:
            query = query.filter(Reservation.session_id == session_id)
            
        reservation = query.first()
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found or does not belong to this session")
            
        db.delete(reservation)
        db.commit()

    @staticmethod
    def transition_item(
        db: Session, 
        current_user_id: int, 
        item_id: str, 
        expected_status: ItemStatus, 
        new_status: ItemStatus, 
        tx_type: TransactionType,
        background_tasks: BackgroundTasks,
        reference_type: Optional[str] = None,
        reference_id: Optional[str] = None,
        reason: Optional[str] = None
    ) -> InventoryItem:
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
            raise HTTPException(status_code=409, detail=f"Item status is {item.status}, expected {expected_status.value}")

        prev_status = item.status
        item.status = new_status
        
        tx = InventoryTransaction(
            inventory_item_id=item.id,
            transaction_type=tx_type,
            previous_status=prev_status,
            new_status=new_status,
            historical_weight=item.weight,
            historical_karat=item.karat,
            historical_cost_basis=item.cost_basis,
            historical_manufacturing_fee=item.manufacturing_fee,
            reference_type=reference_type,
            reference_id=reference_id,
            created_by_id=current_user_id
        )
        db.add(tx)
        
        InventoryService._log_audit(
            background_tasks, current_user_id, f"INVENTORY_STATUS_CHANGE_{tx_type.name}", str(item.id),
            old_vals={"status": prev_status.value},
            new_vals={"status": new_status.value, "reason": reason}
        )
        
        return item
