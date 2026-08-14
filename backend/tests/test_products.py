import pytest
from fastapi.testclient import TestClient



def test_crud_products(client: TestClient, admin_token_headers):
    # 1. Create a Category first
    resp_cat = client.post(
        "/api/v1/categories/",
        headers=admin_token_headers,
        json={"name": "Bracelets"}
    )
    cat_id = resp_cat.json()["id"]

    # 2. Create Product
    response = client.post(
        "/api/v1/products/",
        headers=admin_token_headers,
        json={"name": "Gold Chain 18K", "category_id": cat_id}
    )
    assert response.status_code == 200
    product = response.json()
    assert product["name"] == "Gold Chain 18K"
    assert product["category"]["id"] == cat_id
    prod_id = product["id"]

    # 3. Read Products
    response = client.get("/api/v1/products/", headers=admin_token_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # 4. Update Product
    response = client.put(
        f"/api/v1/products/{prod_id}",
        headers=admin_token_headers,
        json={"name": "Gold Chain 21K"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Gold Chain 21K"

    # 5. Invalid Category ID
    response = client.post(
        "/api/v1/products/",
        headers=admin_token_headers,
        json={"name": "Invalid", "category_id": 9999}
    )
    assert response.status_code == 400

    # 6. Delete Product
    response = client.delete(f"/api/v1/products/{prod_id}", headers=admin_token_headers)
    assert response.status_code == 200

    # 7. Soft deleting category should preserve relationship
    # Let's recreate product
    resp_prod2 = client.post(
        "/api/v1/products/",
        headers=admin_token_headers,
        json={"name": "Gold Chain 21K", "category_id": cat_id}
    )
    prod2_id = resp_prod2.json()["id"]
    
    client.delete(f"/api/v1/categories/{cat_id}", headers=admin_token_headers)
    
    # Read product, it should still have the category info (even though category is_active=False)
    resp_get_prod = client.get("/api/v1/products/", headers=admin_token_headers)
    assert resp_get_prod.status_code == 200
    prods = [p for p in resp_get_prod.json() if p["id"] == prod2_id]
    assert len(prods) == 1
    assert prods[0]["category"]["is_active"] is False


def test_product_employee_permissions(client: TestClient, normal_user_token_headers):
    response = client.post(
        "/api/v1/products/",
        headers=normal_user_token_headers,
        json={"name": "Necklaces", "category_id": 1}
    )
    assert response.status_code == 403

    response = client.get("/api/v1/products/", headers=normal_user_token_headers)
    assert response.status_code == 200
