from typing import Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.models.catalog import Product, Category
from app.models.inventory import InventoryItem, ItemStatus
from app.schemas.inventory import PublicInventoryItemOut

router = APIRouter()

@router.get("/inventory", response_model=List[PublicInventoryItemOut])
def get_public_inventory(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    category_name: Optional[str] = None,
    karat: Optional[int] = None,
    search: Optional[str] = None
) -> Any:
    """
    Public endpoint to discover available inventory.
    Only returns AVAILABLE items.
    Excludes sensitive financial data.
    """
    query = db.query(InventoryItem).options(
        joinedload(InventoryItem.product).joinedload(Product.category)
    ).filter(InventoryItem.status == ItemStatus.AVAILABLE)
    
    if category_id:
        query = query.join(Product).filter(Product.category_id == category_id)
    elif category_name:
        query = query.join(Product).join(Category).filter(Category.name == category_name)
    else:
        # even if not filtering by category, we need to join Product and Category for search
        pass
        
    if search:
        # if not already joined
        if not category_id and not category_name:
            query = query.join(Product).join(Category)
        search_term = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_term)) | 
            (Category.name.ilike(search_term))
        )
        
    if karat:
        query = query.filter(InventoryItem.karat == karat)
        
    # Always sort by newest available first
    items = query.order_by(InventoryItem.created_at.desc()).offset(skip).limit(limit).all()
    return items
