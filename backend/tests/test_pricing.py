import pytest
from fastapi.testclient import TestClient



def test_pricing_engine_calculation(client: TestClient, admin_token_headers):
    # 1. Setup Gold Price for 21K
    response = client.post(
        "/api/v1/gold-prices/",
        headers=admin_token_headers,
        json={"karat": 21, "price_per_gram": "4600.00"}
    )
    assert response.status_code == 200

    # 2. Test Pricing Calculation Success
    # Weight: 10.5
    # Fee: 150.00
    # Discount: 20.00
    # Expected Subtotal: 10.5 * 4600.00 = 48300.00
    # Expected Total: 48300.00 + 150.00 - 20.00 = 48430.00
    response = client.post(
        "/api/v1/pricing/calculate",
        headers=admin_token_headers,
        json={
            "karat": 21,
            "weight": "10.500",
            "manufacturing_fee": "150.00",
            "discount_amount": "20.00"
        }
    )
    assert response.status_code == 200
    data = response.json()
    
    assert data["gold_price_per_gram"] == "4600.00"
    assert data["weight"] == "10.500"
    assert data["manufacturing_fee"] == "150.00"
    assert data["discount_amount"] == "20.00"
    assert data["subtotal"] == "48300.00"
    assert data["total"] == "48430.00"

    # 3. Test Negative Rejection
    response = client.post(
        "/api/v1/pricing/calculate",
        headers=admin_token_headers,
        json={
            "karat": 21,
            "weight": "-10.500",
            "manufacturing_fee": "150.00",
            "discount_amount": "20.00"
        }
    )
    assert response.status_code == 422 # Pydantic ge=0 constraint

    # 4. Test Missing Gold Price
    response = client.post(
        "/api/v1/pricing/calculate",
        headers=admin_token_headers,
        json={
            "karat": 24, # No price exists for 24K
            "weight": "10.500",
            "manufacturing_fee": "150.00",
            "discount_amount": "20.00"
        }
    )
    assert response.status_code == 404

    # 5. Test Employee access
    # Both admin and employee can use pricing engine
    pass # covered by standard auth dependency, but we can verify it works if we have normal_user_token_headers

def test_pricing_employee_permissions(client: TestClient, admin_token_headers, normal_user_token_headers):
    # Setup Gold Price (Admin)
    client.post(
        "/api/v1/gold-prices/",
        headers=admin_token_headers,
        json={"karat": 18, "price_per_gram": "3900.00"}
    )
    
    # Use Engine (Employee)
    response = client.post(
        "/api/v1/pricing/calculate",
        headers=normal_user_token_headers,
        json={
            "karat": 18,
            "weight": "1.000",
            "manufacturing_fee": "0.00",
            "discount_amount": "0.00"
        }
    )
    assert response.status_code == 200
    assert response.json()["total"] == "3900.00"
