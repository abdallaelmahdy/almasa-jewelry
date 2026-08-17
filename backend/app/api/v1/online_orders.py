"""
Online Orders — customer-facing reservation system.

A customer can reserve an AVAILABLE item as an "online order".
No payment is captured at this stage — the item is marked LOCKED
and a reservation row is created. Staff complete the sale in the POS.
"""
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, Field
from datetime import datetime, timedelta, timezone
from uuid import UUID

from app.api import deps
from app.models.user import User
from app.models.inventory import InventoryItem, ItemStatus, Reservation
from app.models.catalog import Product
from app.schemas.inventory import PublicInventoryItemOut
from app.services.audit import log_audit_background

router = APIRouter()

# ── Schemas ────────────────────────────────────────────────────────────────────

class OnlineOrderCreate(BaseModel):
    inventory_item_id: UUID = Field(..., description="UUID of the AVAILABLE item to reserve")
    notes: Optional[str] = Field(None, max_length=500)


class OnlineOrderOut(BaseModel):
    id: str
    inventory_item_id: str
    customer_id: int
    status: str           # PENDING | CANCELLED
    notes: Optional[str]
    expires_at: str
    created_at: str

    class Config:
        from_attributes = True


# ── In-memory order list backed by Reservation table ──────────────────────────
# We re-use the existing Reservation model and tag session_id = f"online:{user.id}"
# so POS sessions never conflict.

ONLINE_RESERVATION_TTL_HOURS = 24


def _online_session_id(user_id: int) -> str:
    return f"online:{user_id}"


@router.post("", response_model=OnlineOrderOut, status_code=status.HTTP_201_CREATED)
def create_online_order(
    payload: OnlineOrderCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks = None,
) -> Any:
    """
    Reserve an item as an online order.
    The customer must be logged in (any role accepted).
    """
    item_id = str(payload.inventory_item_id)

    # Lock the row
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).with_for_update().first()
    if not item:
        raise HTTPException(status_code=404, detail="القطعة غير موجودة")
    if item.status != ItemStatus.AVAILABLE:
        raise HTTPException(status_code=409, detail="القطعة غير متاحة للحجز حالياً")

    # Check no existing reservation
    existing = db.query(Reservation).filter(Reservation.inventory_item_id == item_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="القطعة محجوزة بالفعل")

    session_id = _online_session_id(current_user.id)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=ONLINE_RESERVATION_TTL_HOURS)

    reservation = Reservation(
        inventory_item_id=item.id,
        session_id=session_id,
        expires_at=expires_at,
    )
    db.add(reservation)

    try:
        db.commit()
        db.refresh(reservation)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="القطعة محجوزة بالفعل")

    if background_tasks:
        background_tasks.add_task(
            log_audit_background,
            user_id=current_user.id,
            action_type="ONLINE_ORDER_CREATED",
            resource_id=str(reservation.id),
            new_values={"item_id": item_id},
        )

    return {
        "id": str(reservation.id),
        "inventory_item_id": str(reservation.inventory_item_id),
        "customer_id": current_user.id,
        "status": "PENDING",
        "notes": payload.notes,
        "expires_at": reservation.expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/my", response_model=List[OnlineOrderOut])
def list_my_orders(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """List the current customer's active reservations."""
    session_id = _online_session_id(current_user.id)
    reservations = (
        db.query(Reservation)
        .filter(Reservation.session_id == session_id)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "inventory_item_id": str(r.inventory_item_id),
            "customer_id": current_user.id,
            "status": "PENDING",
            "notes": None,
            "expires_at": r.expires_at.isoformat(),
            "created_at": r.expires_at.isoformat(),  # approximate
        }
        for r in reservations
    ]


@router.delete("/{reservation_id}", status_code=204)
def cancel_order(
    reservation_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> None:
    """Cancel / release a customer's own online reservation."""
    session_id = _online_session_id(current_user.id)
    reservation = (
        db.query(Reservation)
        .filter(
            Reservation.id == reservation_id,
            Reservation.session_id == session_id,
        )
        .first()
    )
    if not reservation:
        raise HTTPException(status_code=404, detail="الحجز غير موجود")

    db.delete(reservation)
    db.commit()
