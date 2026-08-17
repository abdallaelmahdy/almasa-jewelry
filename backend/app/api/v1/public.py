from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func

from app.api import deps
from app.models.catalog import Product, Category, GoldPrice
from app.models.inventory import InventoryItem, ItemStatus
from app.schemas.inventory import PublicInventoryItemOut
from app.schemas.catalog import PublicGoldPriceOut

router = APIRouter()


@router.get("/gold-prices", response_model=List[PublicGoldPriceOut])
def get_public_gold_prices(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Public endpoint: returns the latest gold price per karat.
    No authentication required.
    """
    # Subquery to get the latest effective_from per karat
    latest_subq = db.query(
        GoldPrice.karat,
        func.max(GoldPrice.effective_from).label("latest_effective")
    ).group_by(GoldPrice.karat).subquery()

    prices = db.query(GoldPrice).join(
        latest_subq,
        (GoldPrice.karat == latest_subq.c.karat) &
        (GoldPrice.effective_from == latest_subq.c.latest_effective)
    ).order_by(GoldPrice.karat).all()

    return prices


@router.get("/products", response_model=List[PublicInventoryItemOut])
def get_public_products(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    category_id: Optional[int] = None,
    category_name: Optional[str] = None,
    karat: Optional[int] = None,
    search: Optional[str] = None,
) -> Any:
    """
    Public endpoint: returns AVAILABLE inventory items for the storefront.
    No authentication required.
    """
    query = db.query(InventoryItem).options(
        joinedload(InventoryItem.product).joinedload(Product.category)
    ).filter(InventoryItem.status == ItemStatus.AVAILABLE)

    if category_id:
        query = query.join(Product).filter(Product.category_id == category_id)
    elif category_name:
        query = query.join(Product).join(Category).filter(Category.name == category_name)

    if search:
        if not category_id and not category_name:
            query = query.join(Product).join(Category)
        term = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(term)) | (Category.name.ilike(term))
        )

    if karat:
        query = query.filter(InventoryItem.karat == karat)

    items = query.order_by(InventoryItem.created_at.desc()).offset(skip).limit(limit).all()
    return items
