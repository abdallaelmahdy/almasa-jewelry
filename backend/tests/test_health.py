def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_models_importable():
    # Verify we can import all models without errors
    from app.models.user import User
    from app.models.catalog import Category, Product, GoldPrice
    from app.models.inventory import InventoryItem, InventoryTransaction
    from app.models.sales import Customer, Sale, Invoice, InvoiceItem, Payment, Refund
    from app.models.audit import AuditLog
    
    assert User is not None
    assert GoldPrice is not None
    assert InventoryItem is not None
