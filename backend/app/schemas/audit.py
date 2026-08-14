from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class AuditLogOut(BaseModel):
    id: int
    user_id: int
    action_type: str
    resource_id: str
    old_values: Optional[Any] = None
    new_values: Optional[Any] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
