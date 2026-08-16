import os
import sys
from decimal import Decimal
import uuid

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import SessionLocal
from app.models.user import User
from app.models.catalog import Category, Product, GoldPrice
from app.models.inventory import InventoryItem, ItemStatus
from app.models.sales import Customer
from app.core import security

def get_or_create_user(db, email, username, role, password):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            username=username,
            email=email,
            hashed_password=security.get_password_hash(password),
            role=role,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Created user: {email}")
    return user

def get_or_create_category(db, name):
    cat = db.query(Category).filter(Category.name == name).first()
    if not cat:
        cat = Category(name=name)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        print(f"Created category: {name}")
    return cat

def get_or_create_product(db, name, category_id):
    prod = db.query(Product).filter(Product.name == name).filter(Product.category_id == category_id).first()
    if not prod:
        prod = Product(name=name, category_id=category_id)
        db.add(prod)
        db.commit()
        db.refresh(prod)
        print(f"Created product: {name}")
    return prod

def get_or_create_inventory(db, sku, product_id, weight, karat, mfg_fee, cost_basis, status=ItemStatus.AVAILABLE):
    item = db.query(InventoryItem).filter(InventoryItem.sku == sku).first()
    if not item:
        item = InventoryItem(
            sku=sku,
            product_id=product_id,
            weight=Decimal(str(weight)),
            karat=karat,
            manufacturing_fee=Decimal(str(mfg_fee)),
            cost_basis=Decimal(str(cost_basis)),
            status=status
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        print(f"Created inventory SKU: {sku}")
    return item

def get_or_create_gold_price(db, karat, price, admin_id):
    gp = db.query(GoldPrice).filter(GoldPrice.karat == karat).first()
    if not gp:
        gp = GoldPrice(
            karat=karat,
            price_per_gram=Decimal(str(price)),
            created_by_id=admin_id
        )
        db.add(gp)
        db.commit()
        print(f"Created gold price for {karat}K: {price}")
    return gp

def get_or_create_customer(db, name, phone):
    cust = db.query(Customer).filter(Customer.phone == phone).first()
    if not cust:
        cust = Customer(name=name, phone=phone)
        db.add(cust)
        db.commit()
        print(f"Created customer: {name}")
    return cust

def seed_dev_db():
    db = SessionLocal()
    try:
        print("Starting ALMASA Development Database Seeding...")
        
        # 1. Admin User
        admin = get_or_create_user(db, "admin@almasa.local", "Admin", "admin", "Almasa123!")
        
        # 2. Customers
        customers = [
            ("محمد أحمد", "01000000001"),
            ("أحمد محمود", "01100000002"),
            ("محمود حسن", "01200000003"),
            ("يوسف علي", "01500000004"),
            ("عمر خالد", "01011111111"),
            ("عبدالله حسن", "01222222222")
        ]
        for name, phone in customers:
            get_or_create_customer(db, name, phone)
            
        # 3. Gold Prices
        prices = {
            18: 2500.00,
            21: 3000.00,
            22: 3150.00,
            24: 3450.00
        }
        for k, p in prices.items():
            get_or_create_gold_price(db, k, p, admin.id)
            
        # 4. Categories & Products
        catalog_def = {
            "خواتم": ["خاتم ذهب كلاسيك", "خاتم ذهب بفص", "خاتم سوليتير", "خاتم إيطالي"],
            "أساور": ["سوار ذهب ناعم", "سوار ذهب عريض", "غويشة سادة"],
            "سلاسل": ["سلسلة ذهب كلاسيك", "سلسلة ذهب فخمة", "سلسلة بحرف"],
            "حلق": ["حلق ذهب دائري", "حلق ذهب ناعم"],
            "دبل": ["دبلة ذهب كلاسيك", "دبلة ذهب مزخرفة", "توينز"],
            "أطقم": ["طقم ذهب كلاسيك", "طقم زفاف كامل"],
            "سبائك": ["سبيكة ذهب 5 جرام", "سبيكة ذهب 10 جرام", "سبيكة ذهب 31.1 جرام"]
        }
        
        # Counter for sequential SKUs
        sku_counter = 1
        
        for cat_name, prod_names in catalog_def.items():
            cat = get_or_create_category(db, cat_name)
            
            for prod_name in prod_names:
                prod = get_or_create_product(db, prod_name, cat.id)
                
                # Determine typical karats based on category (Subaek 24, others 21/18)
                karats = [24] if cat_name == "سبائك" else [18, 21]
                
                # Create 1-3 inventory items for each product
                num_items = 2 if cat_name != "أطقم" else 1
                for _ in range(num_items):
                    karat = karats[sku_counter % len(karats)]
                    
                    # Distribute weights
                    weights = [1.250, 2.500, 3.750, 5.000, 7.500, 10.000, 31.100]
                    weight = weights[sku_counter % len(weights)]
                    if cat_name == "أطقم": weight = 50.000
                    if "5 جرام" in prod_name: weight = 5.000
                    if "10 جرام" in prod_name: weight = 10.000
                    
                    mfg_fee = 50.0 * float(weight) if cat_name != "سبائك" else 20.0 * float(weight)
                    cost_basis = prices[karat] * float(weight) * 0.95
                    
                    sku = f"ALM-{sku_counter:06d}"
                    get_or_create_inventory(
                        db, 
                        sku, 
                        prod.id, 
                        weight, 
                        karat, 
                        mfg_fee, 
                        cost_basis
                    )
                    sku_counter += 1
                    
        # 5. Create a couple of SOLD items for realism (using high SKU offsets)
        for i in range(1, 4):
            sku = f"ALM-888{i:03d}"
            get_or_create_inventory(
                db, sku, prod.id, 2.500, 21, 150.0, 7000.0, ItemStatus.SOLD
            )

        print("Seeding completed successfully.")
        
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_dev_db()
