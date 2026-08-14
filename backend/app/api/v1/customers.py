from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api import deps
from app.models.sales import Customer
from app.models.audit import AuditLog
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerOut

router = APIRouter()

def _log_audit(db: Session, user_id: int, action: str, resource_id: str, old_vals: dict = None, new_vals: dict = None):
    audit = AuditLog(
        user_id=user_id,
        action_type=action,
        resource_id=resource_id,
        old_values=old_vals,
        new_values=new_vals,
    )
    db.add(audit)

@router.post("", response_model=CustomerOut)
def create_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_in: CustomerCreate,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Create new customer."""
    customer = Customer(
        name=customer_in.name,
        phone=customer_in.phone
    )
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Customer with this phone number already exists")
        
    _log_audit(db, current_user.id, "CUSTOMER_CREATED", str(customer.id), None, {"name": customer.name, "phone": customer.phone})
    db.commit()
    return customer

@router.get("", response_model=List[CustomerOut])
def list_customers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    phone_prefix: Optional[str] = None,
    name_prefix: Optional[str] = None,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Retrieve customers."""
    query = db.query(Customer)
    if phone_prefix:
        query = query.filter(Customer.phone.startswith(phone_prefix))
    if name_prefix:
        query = query.filter(Customer.name.ilike(f"{name_prefix}%"))
    
    customers = query.offset(skip).limit(limit).all()
    return customers

@router.get("/{id}", response_model=CustomerOut)
def get_customer(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Get customer by ID."""
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.put("/{id}", response_model=CustomerOut)
def update_customer(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    customer_in: CustomerUpdate,
    current_user: Any = Depends(deps.RoleChecker(["admin", "employee"]))
) -> Any:
    """Update a customer."""
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    old_vals = {"name": customer.name, "phone": customer.phone}
    
    customer.name = customer_in.name
    customer.phone = customer_in.phone
    
    try:
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Customer with this phone number already exists")
        
    _log_audit(db, current_user.id, "CUSTOMER_UPDATED", str(customer.id), old_vals, {"name": customer.name, "phone": customer.phone})
    db.commit()
    return customer
