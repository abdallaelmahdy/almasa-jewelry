import pytest
from fastapi.testclient import TestClient



def test_crud_categories(client: TestClient, admin_token_headers):
    # 1. Create Category
    response = client.post(
        "/api/v1/categories/",
        headers=admin_token_headers,
        json={"name": "Rings"}
    )
    assert response.status_code == 200
    category = response.json()
    assert category["name"] == "Rings"
    assert category["is_active"] is True
    cat_id = category["id"]

    # 2. Duplicate Category
    response = client.post(
        "/api/v1/categories/",
        headers=admin_token_headers,
        json={"name": "Rings"}
    )
    assert response.status_code == 400

    # 3. Read Categories (include active only)
    response = client.get("/api/v1/categories/", headers=admin_token_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # 4. Update Category
    response = client.put(
        f"/api/v1/categories/{cat_id}",
        headers=admin_token_headers,
        json={"name": "Gold Rings"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Gold Rings"

    # 5. Soft Delete Category
    response = client.delete(f"/api/v1/categories/{cat_id}", headers=admin_token_headers)
    assert response.status_code == 200
    assert response.json()["is_active"] is False

    # 6. Read Categories (should be excluded by default)
    response = client.get("/api/v1/categories/", headers=admin_token_headers)
    assert response.status_code == 200
    active_cats = response.json()
    assert not any(c["id"] == cat_id for c in active_cats)

    # 7. Read Categories (include inactive)
    response = client.get("/api/v1/categories/?include_inactive=true", headers=admin_token_headers)
    assert response.status_code == 200
    all_cats = response.json()
    assert any(c["id"] == cat_id for c in all_cats)


def test_category_employee_permissions(client: TestClient, normal_user_token_headers):
    response = client.post(
        "/api/v1/categories/",
        headers=normal_user_token_headers,
        json={"name": "Necklaces"}
    )
    assert response.status_code == 403

    response = client.get("/api/v1/categories/", headers=normal_user_token_headers)
    assert response.status_code == 200
