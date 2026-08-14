from fastapi.testclient import TestClient
from app.models.inventory import ItemStatus, TransactionType

def test_inventory_state_machine_and_ledger(client: TestClient, admin_token_headers):
    # Setup Product
    resp_cat = client.post("/api/v1/categories/", headers=admin_token_headers, json={"name": "StateCat"})
    cat_id = resp_cat.json()["id"]
    resp_prod = client.post("/api/v1/products/", headers=admin_token_headers, json={"name": "StateProd", "category_id": cat_id})
    prod_id = resp_prod.json()["id"]

    # 1. Stock Intake (AVAILABLE)
    resp = client.post(
        "/api/v1/inventory/",
        headers=admin_token_headers,
        json={"product_id": prod_id, "weight": "10.000", "karat": 24, "manufacturing_fee": "0", "cost_basis": "100"}
    )
    assert resp.status_code == 200
    inv = resp.json()
    inv_id = inv["id"]

    # Ledger check
    txs_resp = client.get(f"/api/v1/inventory/{inv_id}/transactions", headers=admin_token_headers)
    txs = txs_resp.json()
    assert len(txs) == 1
    assert txs[0]["transaction_type"] == TransactionType.STOCK_IN.value
    assert txs[0]["new_status"] == ItemStatus.AVAILABLE.value

    # 2. Lock item (AVAILABLE -> LOCKED)
    resp = client.post(f"/api/v1/inventory/{inv_id}/lock", headers=admin_token_headers, json={"reason": "Customer hold"})
    assert resp.status_code == 200
    assert resp.json()["status"] == ItemStatus.LOCKED.value

    # Ledger check
    txs = client.get(f"/api/v1/inventory/{inv_id}/transactions", headers=admin_token_headers).json()
    assert len(txs) == 2
    assert txs[1]["transaction_type"] == TransactionType.LOCK.value
    assert txs[1]["previous_status"] == ItemStatus.AVAILABLE.value
    assert txs[1]["new_status"] == ItemStatus.LOCKED.value

    # 3. Invalid Transition (LOCKED -> LOCKED)
    resp = client.post(f"/api/v1/inventory/{inv_id}/lock", headers=admin_token_headers, json={"reason": "Hold again"})
    assert resp.status_code == 409

    # 4. Sell item is not explicitly built in API for inventory, but let's test ADJUST
    resp = client.post(f"/api/v1/inventory/{inv_id}/adjust", headers=admin_token_headers, json={"weight": "9.900", "reason": "Weighing correction"})
    assert resp.status_code == 200
    assert resp.json()["weight"] == "9.900"

    txs = client.get(f"/api/v1/inventory/{inv_id}/transactions", headers=admin_token_headers).json()
    assert len(txs) == 3
    assert txs[2]["transaction_type"] == TransactionType.ADJUST.value
    assert txs[2]["historical_weight"] == "9.900" 

    # 5. Admin can list all transactions
    all_txs_resp = client.get("/api/v1/inventory-transactions", headers=admin_token_headers)
    assert all_txs_resp.status_code == 200
    assert len(all_txs_resp.json()) >= 3
