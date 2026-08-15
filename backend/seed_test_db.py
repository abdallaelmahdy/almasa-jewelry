import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from app.models.catalog import Category, Product, GoldPrice
from app.models.inventory import InventoryItem, ItemStatus
from app.core import security
from decimal import Decimal

db = SessionLocal()

admin = User(username="admin@test.com", email="admin@test.com", hashed_password=security.get_password_hash("Password123!"), role="admin", is_active=True)
db.add(admin)
emp = User(username="employee@test.com", email="employee@test.com", hashed_password=security.get_password_hash("Password123!"), role="employee", is_active=True)
db.add(emp)
db.commit()

cat = Category(name="Test Category")
db.add(cat)
db.commit()
db.refresh(cat)

prod = Product(name="Test Gold Ring", category_id=cat.id)
db.add(prod)
db.commit()
db.refresh(prod)

gp = GoldPrice(karat=24, price_per_gram=Decimal("200.00"), created_by_id=admin.id)
db.add(gp)
db.commit()

item1 = InventoryItem(sku="TEST-001", product_id=prod.id, weight=Decimal("10.00"), karat=24, manufacturing_fee=Decimal("50.00"), cost_basis=Decimal("1000.00"), status=ItemStatus.AVAILABLE)
item2 = InventoryItem(sku="TEST-002", product_id=prod.id, weight=Decimal("5.00"), karat=24, manufacturing_fee=Decimal("25.00"), cost_basis=Decimal("500.00"), status=ItemStatus.AVAILABLE)
item3 = InventoryItem(sku="TEST-003", product_id=prod.id, weight=Decimal("8.00"), karat=24, manufacturing_fee=Decimal("40.00"), cost_basis=Decimal("800.00"), status=ItemStatus.AVAILABLE)
db.add_all([item1, item2, item3])
db.commit()

from app.models.sales import Sale, Payment, Invoice, InvoiceItem
item2.status = ItemStatus.SOLD
db.add(item2)

sale = Sale(total_amount=Decimal("525.00"), status="COMPLETED", user_id=admin.id, idempotency_key="test-refund-seeded")
db.add(sale)
db.commit()

payment = Payment(sale_id=sale.id, amount=Decimal("525.00"), method="CASH")
db.add(payment)

invoice = Invoice(sale_id=sale.id, invoice_number="INV-TEST-999")
db.add(invoice)
db.commit()

inv_item = InvoiceItem(invoice_id=invoice.id, inventory_item_id=item2.id, historical_karat=24, historical_weight=Decimal("5.00"), historical_gold_price_per_gram=Decimal("200.00"), historical_manufacturing_fee=Decimal("25.00"), line_total=Decimal("525.00"))
db.add(inv_item)
db.commit()
db.close()
print("Seeding complete.")
