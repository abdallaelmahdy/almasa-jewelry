from app.db.session import SessionLocal
from app.models.audit import AuditLog

def log_audit_background(user_id: int, action_type: str, resource_id: str, old_values: dict = None, new_values: dict = None, ip_address: str = None):
    db = SessionLocal()
    try:
        audit = AuditLog(
            user_id=user_id,
            action_type=action_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address
        )
        db.add(audit)
        db.commit()
    except Exception as e:
        # In a background task, we just log to console or logger, since we cannot return HTTP error
        print(f"Error logging audit in background: {e}")
        db.rollback()
    finally:
        db.close()
