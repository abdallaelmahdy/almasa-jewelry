from fastapi.testclient import TestClient

def test_audit_admin_access(client: TestClient, admin_token_headers: dict):
    r = client.get("/api/v1/audit", headers=admin_token_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_audit_employee_denied(client: TestClient, normal_user_token_headers: dict):
    r = client.get("/api/v1/audit", headers=normal_user_token_headers)
    assert r.status_code == 403

def test_audit_filters(client: TestClient, admin_token_headers: dict):
    # Perform an action to create an audit log
    client.post("/api/v1/customers", json={"name": "Audit Test", "phone": "1000"}, headers=admin_token_headers)
    
    # Filter by action_type
    r = client.get("/api/v1/audit?action_type=CUSTOMER_CREATED", headers=admin_token_headers)
    assert r.status_code == 200
    logs = r.json()
    assert len(logs) >= 1
    assert logs[0]["action_type"] == "CUSTOMER_CREATED"
    assert "Audit Test" in str(logs[0]["new_values"])
