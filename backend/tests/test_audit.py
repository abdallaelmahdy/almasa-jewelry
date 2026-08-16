from fastapi.testclient import TestClient

def test_audit_admin_access(client: TestClient, admin_token_headers: dict):
    r = client.get("/api/v1/audit", headers=admin_token_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_audit_employee_denied(client: TestClient, normal_user_token_headers: dict):
    r = client.get("/api/v1/audit", headers=normal_user_token_headers)
    assert r.status_code == 403

from app.models.audit import AuditLog
from sqlalchemy.orm import Session

def test_audit_filters(client: TestClient, admin_token_headers: dict, db_session: Session):
    from app.models.user import User
    user = db_session.query(User).first()
    
    # Perform an action to create an audit log manually to bypass BackgroundTask SessionLocal issues
    audit = AuditLog(
        user_id=user.id,
        action_type="CUSTOMER_CREATED",
        resource_id="1",
        new_values={"name": "Audit Test", "phone": "1000"}
    )
    db_session.add(audit)
    db_session.commit()
    
    # Filter by action_type
    r = client.get("/api/v1/audit?action_type=CUSTOMER_CREATED", headers=admin_token_headers)
    assert r.status_code == 200
    logs = r.json()
    assert len(logs) >= 1
    assert logs[0]["action_type"] == "CUSTOMER_CREATED"
    assert "Audit Test" in str(logs[0]["new_values"])
