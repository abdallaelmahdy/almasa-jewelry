from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api import deps
from app.models.catalog import GoldPrice
from app.schemas.pricing import PricingCalculateRequestItem, PricingCalculateResponseItem

router = APIRouter()

@router.post("/calculate", response_model=PricingCalculateResponseItem)
def calculate_price(
    *,
    db: Session = Depends(deps.get_db),
    item: PricingCalculateRequestItem,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """
    Centralized pricing engine.
    Calculates the current price based on the latest gold price for the requested karat.
    """
    current_price = (
        db.query(GoldPrice)
        .filter(GoldPrice.karat == item.karat)
        .order_by(desc(GoldPrice.effective_from), desc(GoldPrice.id))
        .first()
    )
    if not current_price:
        raise HTTPException(
            status_code=404,
            detail=f"No gold price history found for {item.karat}K."
        )
    
    subtotal = item.weight * current_price.price_per_gram
    total = subtotal + item.manufacturing_fee - item.discount_amount

    return PricingCalculateResponseItem(
        karat=item.karat,
        gold_price_per_gram=current_price.price_per_gram,
        weight=item.weight,
        manufacturing_fee=item.manufacturing_fee,
        discount_amount=item.discount_amount,
        subtotal=subtotal,
        total=total
    )
