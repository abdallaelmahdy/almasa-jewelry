from fastapi.testclient import TestClient

def test_create_customer(client: TestClient, admin_token_headers: dict):
    response = client.post("/api/v1/customers", json={
        "name": "Ali Test",
        "phone": "+201011122233"
    }, headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Ali Test"
    assert data["phone"] == "+201011122233"
    assert "id" in data

def test_create_customer_duplicate_phone(client: TestClient, normal_user_token_headers: dict):
    # Create first
    resp1 = client.post("/api/v1/customers", json={
        "name": "First",
        "phone": "+999"
    }, headers=normal_user_token_headers)
    assert resp1.status_code == 200
    
    # Create duplicate
    resp2 = client.post("/api/v1/customers", json={
        "name": "Second",
        "phone": "+999"
    }, headers=normal_user_token_headers)
    assert resp2.status_code == 409
    assert "already exists" in resp2.json()["detail"]

def test_create_customer_multiple_nulls(client: TestClient, normal_user_token_headers: dict):
    resp1 = client.post("/api/v1/customers", json={"name": "No Phone 1"}, headers=normal_user_token_headers)
    assert resp1.status_code == 200
    
    resp2 = client.post("/api/v1/customers", json={"name": "No Phone 2"}, headers=normal_user_token_headers)
    assert resp2.status_code == 200

def test_list_and_search_customers(client: TestClient, normal_user_token_headers: dict):
    client.post("/api/v1/customers", json={"name": "Mohamed", "phone": "0100"}, headers=normal_user_token_headers)
    client.post("/api/v1/customers", json={"name": "Mona", "phone": "0101"}, headers=normal_user_token_headers)
    
    # List all
    r = client.get("/api/v1/customers", headers=normal_user_token_headers)
    assert r.status_code == 200
    assert len(r.json()) >= 2
    
    # Search by phone
    r2 = client.get("/api/v1/customers?phone_prefix=0100", headers=normal_user_token_headers)
    assert r2.status_code == 200
    assert len(r2.json()) == 1
    assert r2.json()[0]["name"] == "Mohamed"
    
    # Search by name
    r3 = client.get("/api/v1/customers?name_prefix=Mo", headers=normal_user_token_headers)
    assert r3.status_code == 200
    assert len(r3.json()) == 2

def test_update_customer(client: TestClient, admin_token_headers: dict):
    c = client.post("/api/v1/customers", json={"name": "Old", "phone": "123"}, headers=admin_token_headers).json()
    
    r = client.put(f"/api/v1/customers/{c['id']}", json={"name": "New", "phone": "123"}, headers=admin_token_headers)
    assert r.status_code == 200
    assert r.json()["name"] == "New"
