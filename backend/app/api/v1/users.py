from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate

router = APIRouter()

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("", response_model=List[UserSchema], dependencies=[Depends(deps.RoleChecker(["admin"]))])
def list_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List all users. (Admin only)
    """
    # Exclude non-loginable system accounts
    users = (
        db.query(User)
        .filter(User.is_active != False or User.email != "system@almasa.local")
        .filter(User.email != "system@almasa.local")
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return users

@router.patch("/{user_id}/deactivate", response_model=UserSchema, dependencies=[Depends(deps.RoleChecker(["admin"]))])
def deactivate_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Deactivate a user account. (Admin only)
    Cannot deactivate your own account.
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="لا يمكنك إلغاء تفعيل حسابك الخاص")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    db.commit()
    db.refresh(user)
    return user

@router.post("", response_model=UserSchema, dependencies=[Depends(deps.RoleChecker(["admin"]))])
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user. (Admin only)
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user_by_username = db.query(User).filter(User.username == user_in.username).first()
    if user_by_username:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    if not security.is_password_strong(user_in.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 12 characters long.",
        )
        
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=security.get_password_hash(user_in.password),
        role=user_in.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
