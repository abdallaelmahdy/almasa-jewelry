from fastapi.testclient import TestClient
from app.models.inventory import ItemStatus
import uuid

def test_inventory_creation(client: TestClient, admin_token_headers):
    # Create category & product first
    resp_cat = client.post("/api/v1/categories/", headers=admin_token_headers, json={"name": "Rings"})
    cat_id = resp_cat.json()["id"]
    
    resp_prod = client.post("/api/v1/products/", headers=admin_token_headers, json={"name": "Gold Ring 21K", "category_id": cat_id})
    prod_id = resp_prod.json()["id"]

    # Stock intake
    resp = client.post(
        "/api/v1/inventory/",
        headers=admin_token_headers,
        json={
            "product_id": prod_id,
            "weight": "12.500",
            "karat": 21,
            "manufacturing_fee": "150.00",
            "cost_basis": "45000.00"
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["sku"].startswith("ALM-")
    assert data["status"] == ItemStatus.AVAILABLE
    assert data["weight"] == "12.500"
    assert data["cost_basis"] == "45000.00"

def test_inventory_invalid_creation(client: TestClient, admin_token_headers):
    # Invalid Karat
    resp = client.post(
        "/api/v1/inventory/",
        headers=admin_token_headers,
        json={"product_id": 1, "weight": "12.500", "karat": 19, "manufacturing_fee": "0", "cost_basis": "1000"}
    )
    assert resp.status_code == 422 # Pydantic validation fails

    # Negative Weight
    resp = client.post(
        "/api/v1/inventory/",
        headers=admin_token_headers,
        json={"product_id": 1, "weight": "-1.500", "karat": 21, "manufacturing_fee": "0", "cost_basis": "1000"}
    )
    assert resp.status_code == 422

def test_inventory_read(client: TestClient, normal_user_token_headers, admin_token_headers):
    # Ensure product
    resp_cat = client.post("/api/v1/categories/", headers=admin_token_headers, json={"name": "Bracelets_INV"})
    cat_id = resp_cat.json()["id"]
    resp_prod = client.post("/api/v1/products/", headers=admin_token_headers, json={"name": "B_INV", "category_id": cat_id})
    prod_id = resp_prod.json()["id"]
    
    resp = client.post(
        "/api/v1/inventory/",
        headers=admin_token_headers,
        json={"product_id": prod_id, "weight": "10.000", "karat": 18, "manufacturing_fee": "0", "cost_basis": "10"}
    )
    inv_id = resp.json()["id"]
    sku = resp.json()["sku"]

    # Employee can list
    resp = client.get("/api/v1/inventory/", headers=normal_user_token_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1

    # Employee can get by id
    resp = client.get(f"/api/v1/inventory/{inv_id}", headers=normal_user_token_headers)
    assert resp.status_code == 200

    # Employee can get by sku
    resp = client.get(f"/api/v1/inventory/sku/{sku}", headers=normal_user_token_headers)
    assert resp.status_code == 200

def test_inventory_employee_no_write(client: TestClient, normal_user_token_headers):
    resp = client.post(
        "/api/v1/inventory/",
        headers=normal_user_token_headers,
        json={"product_id": 1, "weight": "12.500", "karat": 21, "manufacturing_fee": "0", "cost_basis": "1000"}
    )
    assert resp.status_code == 403
