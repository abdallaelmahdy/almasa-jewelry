import sys
import os
sys.path.append('.')
from app.db.session import SessionLocal
import app.models.user
from app.models.inventory import InventoryItem, ItemStatus
from app.models.catalog import GoldPrice
from app.services.sales import SalesService
from app.schemas.sales import CheckoutRequest, PaymentInput
from fastapi import BackgroundTasks

def test_dry_run():
    db = SessionLocal()
    try:
        # Find an available item
        item = db.query(InventoryItem).filter(InventoryItem.status == ItemStatus.AVAILABLE).first()
        if not item:
            print("No AVAILABLE items found")
            return

        print(f"Found item {item.sku} (Karat: {item.karat}, Weight: {item.weight}, Mfg: {item.manufacturing_fee})")
        
        # Get latest gold price for this karat
        from sqlalchemy import desc
        latest_price = db.query(GoldPrice).filter(GoldPrice.karat == item.karat).order_by(desc(GoldPrice.effective_from)).first()
        price_per_gram = latest_price.price_per_gram if latest_price else 0
        
        expected_total = (item.weight * price_per_gram) + item.manufacturing_fee
        print(f"Calculated authoritative total: {expected_total} (Gold price: {price_per_gram})")
        
        request = CheckoutRequest(
            inventory_item_ids=[str(item.id)],
            customer_id=1,  # Assuming customer 1 exists
            payments=[PaymentInput(method="CASH", amount=expected_total)],
            idempotency_key="test_audit_key_123"
        )
        
        bg = BackgroundTasks()
        
        # We will attempt the checkout, but then explicitly rollback
        print("Executing SalesService.checkout...")
        try:
            sale = SalesService.checkout(db, request, 1, bg, "test_session")
            print(f"Checkout generated Sale ID: {sale.id}, Total: {sale.total_amount}")
        except Exception as e:
            print(f"Checkout threw exception: {e}")
        
    finally:
        # ALWAYS ROLLBACK to prevent destructive modifications during audit
        print("Rolling back database transaction...")
        db.rollback()
        db.close()

if __name__ == "__main__":
    test_dry_run()
