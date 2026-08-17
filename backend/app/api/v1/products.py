from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.api import deps
from app.models.catalog import Product, Category
from app.schemas.catalog import ProductCreate, ProductUpdate, ProductOut

router = APIRouter()

@router.get("/", response_model=List[ProductOut])
def read_products(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """
    Retrieve products.
    """
    products = db.query(Product).offset(skip).limit(limit).all()
    return products

@router.post("/", response_model=ProductOut)
def create_product(
    *,
    db: Session = Depends(deps.get_db),
    product_in: ProductCreate,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Create new product. Admin only.
    """
    category = db.query(Category).filter(Category.id == product_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    
    product = Product(
        name=product_in.name,
        category_id=product_in.category_id,
        image_url=product_in.image_url,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{id}", response_model=ProductOut)
def update_product(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    product_in: ProductUpdate,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Update a product. Admin only.
    """
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product_in.name is not None:
        product.name = product_in.name
    if product_in.category_id is not None:
        category = db.query(Category).filter(Category.id == product_in.category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
        product.category_id = product_in.category_id
    if product_in.image_url is not None:
        product.image_url = product_in.image_url

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{id}", response_model=ProductOut)
def delete_product(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Delete a product. Admin only.
    """
    product = db.query(Product).options(joinedload(Product.category)).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Store data for return before deletion
    product_data = {
        "id": product.id,
        "name": product.name,
        "category_id": product.category_id,
        "created_at": product.created_at,
        "category": {
            "id": product.category.id,
            "name": product.category.name,
            "is_active": product.category.is_active
        }
    }
    
    db.delete(product)
    db.commit()
    return product_data
