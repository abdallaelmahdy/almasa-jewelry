from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.catalog import Category, Product
from app.schemas.catalog import CategoryCreate, CategoryUpdate, CategoryOut

router = APIRouter()

@router.get("/", response_model=List[CategoryOut])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """
    Retrieve categories.
    By default, returns only active categories.
    """
    query = db.query(Category)
    if not include_inactive:
        query = query.filter(Category.is_active == True)
    categories = query.offset(skip).limit(limit).all()
    return categories

@router.post("/", response_model=CategoryOut)
def create_category(
    *,
    db: Session = Depends(deps.get_db),
    category_in: CategoryCreate,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Create new category. Admin only.
    """
    category = db.query(Category).filter(Category.name == category_in.name).first()
    if category:
        raise HTTPException(
            status_code=400,
            detail="The category with this name already exists in the system.",
        )
    category = Category(name=category_in.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{id}", response_model=CategoryOut)
def update_category(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    category_in: CategoryUpdate,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Update a category. Admin only.
    """
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if category_in.name is not None:
        # Check uniqueness
        existing_cat = db.query(Category).filter(Category.name == category_in.name, Category.id != id).first()
        if existing_cat:
            raise HTTPException(status_code=400, detail="Another category with this name already exists.")
        category.name = category_in.name
    
    if category_in.is_active is not None:
        category.is_active = category_in.is_active

    db.commit()
    db.refresh(category)
    return category

@router.delete("/{id}", response_model=CategoryOut)
def delete_category(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Soft-delete a category. Admin only.
    """
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.is_active = False
    db.commit()
    db.refresh(category)
    return category
