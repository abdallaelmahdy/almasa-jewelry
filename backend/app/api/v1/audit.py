from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.api import deps
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogOut

router = APIRouter()

@router.get("", response_model=List[AuditLogOut])
def list_audit_logs(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[int] = None,
    action_type: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: Any = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """Retrieve audit logs."""
    query = db.query(AuditLog)
    
    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)
    if action_type:
        query = query.filter(AuditLog.action_type == action_type)
    if date_from:
        query = query.filter(AuditLog.created_at >= date_from)
    if date_to:
        query = query.filter(AuditLog.created_at < date_to)
        
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs
