from datetime import datetime, timedelta, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.models.auth import RefreshSession
from fastapi import BackgroundTasks
from app.services.audit import log_audit_background
from app.schemas.token import Token

from app.core.rate_limit import limiter

router = APIRouter()

def _create_audit_log(background_tasks: BackgroundTasks, user_id: int, action: str, ip: str = None) -> None:
    background_tasks.add_task(
        log_audit_background,
        user_id=user_id,
        action_type=action,
        resource_id="auth",
        ip_address=ip
    )

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login_access_token(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        # We don't log passwords or user info here if failed, generic message
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user")
    
    _create_audit_log(background_tasks, user.id, "LOGIN_SUCCESS", request.client.host if request.client else None)
    
    # Generate tokens
    access_token = security.create_access_token(user.id, user.role)
    raw_refresh_token = security.generate_refresh_token()
    hashed_refresh = security.hash_refresh_token(raw_refresh_token)
    
    # Store refresh session
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_session = RefreshSession(
        user_id=user.id,
        token_hash=hashed_refresh,
        expires_at=expires_at
    )
    db.add(db_session)
    db.commit()
    
    # Set HttpOnly Cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh_token,
        httponly=True,
        secure=True if settings.ENVIRONMENT == "production" else False,
        samesite="strict",
        path="/api/v1/auth",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
def refresh_token(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Refresh access token using HttpOnly cookie and rotate the refresh token.
    """
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token_hash = security.hash_refresh_token(refresh_token)
    session = db.query(RefreshSession).filter(RefreshSession.token_hash == token_hash).first()
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    if session.is_revoked:
        # Reuse detected! Revoke all sessions for this user.
        db.query(RefreshSession).filter(RefreshSession.user_id == session.user_id).update({"is_revoked": True})
        _create_audit_log(background_tasks, session.user_id, "SECURITY_EVENT_REFRESH_REUSE", request.client.host if request.client else None)
        db.commit()
        response.delete_cookie(key="refresh_token", path="/api/v1/auth", httponly=True, secure=True if settings.ENVIRONMENT == "production" else False, samesite="strict")
        raise HTTPException(status_code=401, detail="Session invalid")
    
    if session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid user")
    
    # Mark old token as revoked (rotation)
    session.is_revoked = True
    
    # Issue new tokens
    access_token = security.create_access_token(user.id, user.role)
    new_raw_refresh = security.generate_refresh_token()
    new_hashed_refresh = security.hash_refresh_token(new_raw_refresh)
    
    new_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    new_session = RefreshSession(
        user_id=user.id,
        token_hash=new_hashed_refresh,
        expires_at=new_expires_at
    )
    db.add(new_session)
    db.commit()
    
    response.set_cookie(
        key="refresh_token",
        value=new_raw_refresh,
        httponly=True,
        secure=True if settings.ENVIRONMENT == "production" else False,
        samesite="strict",
        path="/api/v1/auth",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Log out by revoking the refresh session and clearing the cookie.
    """
    if refresh_token:
        token_hash = security.hash_refresh_token(refresh_token)
        session = db.query(RefreshSession).filter(RefreshSession.token_hash == token_hash).first()
        if session:
            session.is_revoked = True
            _create_audit_log(background_tasks, session.user_id, "LOGOUT", request.client.host if request.client else None)
            db.commit()
            
    response.delete_cookie(
        key="refresh_token",
        path="/api/v1/auth",
        httponly=True,
        secure=True if settings.ENVIRONMENT == "production" else False,
        samesite="strict"
    )
    return {"msg": "Successfully logged out"}
