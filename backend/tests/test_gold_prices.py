import pytest
from fastapi.testclient import TestClient



def test_gold_prices_append_and_current(client: TestClient, admin_token_headers):
    # 1. Reject unsupported karat
    response = client.post(
        "/api/v1/gold-prices/",
        headers=admin_token_headers,
        json={"karat": 19, "price_per_gram": "4500.00"}
    )
    assert response.status_code == 422 # Pydantic validation error

    # 2. Append new gold price
    response = client.post(
        "/api/v1/gold-prices/",
        headers=admin_token_headers,
        json={"karat": 21, "price_per_gram": "4500.00"}
    )
    assert response.status_code == 200
    assert response.json()["price_per_gram"] == "4500.00"

    # 3. Append another price for same karat
    response = client.post(
        "/api/v1/gold-prices/",
        headers=admin_token_headers,
        json={"karat": 21, "price_per_gram": "4600.00"}
    )
    assert response.status_code == 200

    # 4. Get Current Price (should be the latest one: 4600.00)
    response = client.get(
        "/api/v1/gold-prices/current?karat=21",
        headers=admin_token_headers
    )
    assert response.status_code == 200
    assert response.json()["price_per_gram"] == "4600.00"

    # 5. Missing Gold Price handling
    response = client.get(
        "/api/v1/gold-prices/current?karat=24",
        headers=admin_token_headers
    )
    assert response.status_code == 404

    # 6. Verify append-only behavior (no PUT/DELETE endpoints exist, so 405 Method Not Allowed or 404 Not Found depending on router config)
    response = client.put(
        "/api/v1/gold-prices/1",
        headers=admin_token_headers,
        json={"price_per_gram": "5000.00"}
    )
    assert response.status_code in [404, 405] # Method Not Allowed or Not Found

    response = client.delete(
        "/api/v1/gold-prices/1",
        headers=admin_token_headers
    )
    assert response.status_code in [404, 405]


def test_gold_prices_employee_permissions(client: TestClient, normal_user_token_headers):
    # Employee cannot post price
    response = client.post(
        "/api/v1/gold-prices/",
        headers=normal_user_token_headers,
        json={"karat": 21, "price_per_gram": "4500.00"}
    )
    assert response.status_code == 403

    # Employee can read prices
    response = client.get(
        "/api/v1/gold-prices/",
        headers=normal_user_token_headers
    )
    assert response.status_code == 200
