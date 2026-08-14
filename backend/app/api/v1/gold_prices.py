from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api import deps
from app.models.catalog import GoldPrice
from app.schemas.catalog import GoldPriceCreate, GoldPriceOut
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[GoldPriceOut])
def read_gold_prices(
    db: Session = Depends(deps.get_db),
    karat: int = None,
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """
    Retrieve historical gold prices.
    """
    query = db.query(GoldPrice)
    if karat is not None:
        query = query.filter(GoldPrice.karat == karat)
    
    # Always order newest first
    prices = query.order_by(desc(GoldPrice.effective_from), desc(GoldPrice.id)).offset(skip).limit(limit).all()
    return prices

@router.get("/current", response_model=GoldPriceOut)
def get_current_gold_price(
    karat: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """
    Get the current active gold price for a specific karat.
    """
    current_price = (
        db.query(GoldPrice)
        .filter(GoldPrice.karat == karat)
        .order_by(desc(GoldPrice.effective_from), desc(GoldPrice.id))
        .first()
    )
    if not current_price:
        raise HTTPException(
            status_code=404,
            detail=f"No gold price history found for {karat}K."
        )
    return current_price

@router.post("/", response_model=GoldPriceOut)
def create_gold_price(
    *,
    db: Session = Depends(deps.get_db),
    price_in: GoldPriceCreate,
    current_user: User = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Append a new gold price. Admin only.
    """
    new_price = GoldPrice(
        karat=price_in.karat,
        price_per_gram=price_in.price_per_gram,
        created_by_id=current_user.id
    )
    db.add(new_price)
    db.commit()
    db.refresh(new_price)
    return new_price
