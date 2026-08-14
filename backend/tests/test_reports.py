import pytest
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy import text

def test_financial_reports(client, admin_token_headers, db_session):
    # 1. Create a category, product, gold price, and item
    cat_resp = client.post("/api/v1/categories", json={"name": "ReportCat", "description": "Desc"}, headers=admin_token_headers)
    cat_id = cat_resp.json()["id"]
    
    prod_resp = client.post("/api/v1/products", json={"category_id": cat_id, "name": "ReportProd", "description": "Desc"}, headers=admin_token_headers)
    prod_id = prod_resp.json()["id"]
    
    gp_resp = client.post("/api/v1/gold-prices", json={"karat": 21, "price_per_gram": "3000.00"}, headers=admin_token_headers)
    assert gp_resp.status_code == 200, gp_resp.json()
    
    # Intake 2 items
    in_resp1 = client.post("/api/v1/inventory/", json={
        "product_id": prod_id, "weight": "10.000", "karat": 21, "cost_basis": "25000.00", "manufacturing_fee": "500.00"
    }, headers=admin_token_headers)
    item1_id = in_resp1.json()["id"]

    in_resp2 = client.post("/api/v1/inventory/", json={
        "product_id": prod_id, "weight": "20.000", "karat": 21, "cost_basis": "50000.00", "manufacturing_fee": "1000.00"
    }, headers=admin_token_headers)
    item2_id = in_resp2.json()["id"]
    
    # We want Day 1 and Day 2
    day1_start = datetime.utcnow() - timedelta(days=5)
    day1_end = day1_start + timedelta(days=1)
    day2_start = day1_end
    day2_end = day2_start + timedelta(days=1)
    
    # Sale on Day 1 for Item 1
    # Expected line total: (10g * 3000) + 500 = 30500
    client.post(f"/api/v1/inventory/{item1_id}/lock", json={"reason": "lock"}, headers=admin_token_headers)
    sale1_resp = client.post("/api/v1/sales/checkout", json={
        "inventory_item_ids": [item1_id],
        "idempotency_key": "sale_report_1",
        "payments": [{"method": "CASH", "amount": "30500.00"}]
    }, headers=admin_token_headers)
    assert sale1_resp.status_code == 201, f"Checkout failed: {sale1_resp.json()}"
    sale1_id = sale1_resp.json()["id"]
    
    # Sale on Day 1 for Item 2
    # Expected line total: (20g * 3000) + 1000 = 61000
    client.post(f"/api/v1/inventory/{item2_id}/lock", json={"reason": "lock"}, headers=admin_token_headers)
    sale2_resp = client.post("/api/v1/sales/checkout", json={
        "inventory_item_ids": [item2_id],
        "idempotency_key": "sale_report_2",
        "payments": [{"method": "CARD", "amount": "61000.00"}]
    }, headers=admin_token_headers)
    assert sale2_resp.status_code == 201, f"Checkout 2 failed: {sale2_resp.json()}"
    sale2_id = sale2_resp.json()["id"]
    
    # Manually override created_at in the DB session to simulate Day 1
    db_session.execute(text(f"UPDATE sales SET created_at = '{day1_start.isoformat()}' WHERE id IN ({sale1_id}, {sale2_id})"))
    db_session.execute(text(f"UPDATE inventory_transactions SET created_at = '{day1_start.isoformat()}' WHERE reference_type = 'SALE' AND reference_id IN ('{sale1_id}', '{sale2_id}')"))
    db_session.commit()
        
    # Refund Sale 2 on Day 2
    ref_resp = client.post(f"/api/v1/sales/{sale2_id}/refund", json={"reason": "defective"}, headers=admin_token_headers)
    assert ref_resp.status_code == 200, f"Refund failed: {ref_resp.json()}"
    
    # Override Refund created_at to Day 2
    db_session.execute(text(f"UPDATE refunds SET created_at = '{day2_start.isoformat()}'"))
    db_session.execute(text(f"UPDATE inventory_transactions SET created_at = '{day2_start.isoformat()}' WHERE reference_type = 'REFUND' AND reference_id = '{sale2_id}'"))
    db_session.commit()
    
    # Test Day 1 Report
    r_day1 = client.get(f"/api/v1/reports/sales-summary?date_from={day1_start.isoformat()}&date_to={day1_end.isoformat()}", headers=admin_token_headers)
    d1 = r_day1.json()
    assert Decimal(d1["gross_sales"]) == Decimal("91500.00") # 30500 + 61000
    assert Decimal(d1["refunds"]) == Decimal("0.00")
    assert Decimal(d1["net_sales"]) == Decimal("91500.00")
    assert Decimal(d1["cogs"]) == Decimal("75000.00") # 25000 + 50000
    assert Decimal(d1["gross_profit"]) == Decimal("16500.00")
    
    # Test Day 2 Report
    r_day2 = client.get(f"/api/v1/reports/sales-summary?date_from={day2_start.isoformat()}&date_to={day2_end.isoformat()}", headers=admin_token_headers)
    d2 = r_day2.json()
    assert Decimal(d2["gross_sales"]) == Decimal("0.00")
    assert Decimal(d2["refunds"]) == Decimal("61000.00")
    assert Decimal(d2["net_sales"]) == Decimal("-61000.00")
    assert Decimal(d2["cogs"]) == Decimal("-50000.00") # RETURN transaction subtracts from COGS
    assert Decimal(d2["gross_profit"]) == Decimal("-11000.00") # Net Sales - COGS -> -61000 - (-50000)
    
    # Valuation report
    val = client.get("/api/v1/reports/inventory-valuation", headers=admin_token_headers)
    assert val.status_code == 200
    assert Decimal(val.json()["total_cost_basis"]) == Decimal("0.00") # Item 1 is SOLD, Item 2 is RETURNED
