from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.models.user import User
from app.models.sales import Sale
from app.schemas.sales import CheckoutRequest, SaleOut, RefundRequest, RefundResponse
from app.services.sales import SalesService

router = APIRouter()

@router.post("/checkout", response_model=SaleOut, status_code=status.HTTP_201_CREATED)
def checkout(
    *,
    db: Session = Depends(deps.get_db),
    request: CheckoutRequest,
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks
):
    """Process a POS checkout using SalesService"""
    # Assuming POS passes a session ID, or we use a default
    # For now, we will pass a placeholder session string, or we could extract it from the request if added to schema
    return SalesService.checkout(db, request, current_user.id, background_tasks, session_id="pos_session")


@router.post("/{sale_id}/refund", response_model=RefundResponse)
def refund_sale(
    sale_id: int,
    request: RefundRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.RoleChecker(["admin"]))
):
    """Process a sale refund using SalesService"""
    return SalesService.refund_sale(db, sale_id, request, current_user.id, background_tasks)


@router.get("/", response_model=List[SaleOut])
def list_sales(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """List sales"""
    sales = db.query(Sale).order_by(Sale.created_at.desc()).offset(skip).limit(limit).all()
    return sales


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(
    sale_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get a single sale by ID"""
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale
