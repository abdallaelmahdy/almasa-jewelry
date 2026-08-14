import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function globalSetup(config: FullConfig) {
  const backendDir = path.resolve(__dirname, '../../backend');
  
  console.log('--- Playwright Global Setup ---');
  console.log('1. Setting up test database...');

  // Use the test database URL
  const testDbUrl = 'postgresql://almasa:almasa_password@localhost:5432/almasa_jewelry_test';
  const defaultDbUrl = 'postgresql://almasa:almasa_password@localhost:5432/postgres'; // Connect to default to create the new one

  // Create test database using Python to ensure cross-platform compatibility without relying on psql
  const createDbScript = `
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
try:
    conn = psycopg2.connect("postgresql://almasa:almasa_password@localhost:5432/postgres")
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    cur.execute("DROP DATABASE IF EXISTS almasa_jewelry_test;")
    cur.execute("CREATE DATABASE almasa_jewelry_test;")
    cur.close()
    conn.close()
    print("Test database created successfully via Python.")
except Exception as e:
    print(f"Error creating database: {e}")
  `;
  
  const tempDbScriptPath = path.resolve(backendDir, 'create_db.py');
  fs.writeFileSync(tempDbScriptPath, createDbScript);
  
  let pythonCmd = 'python';
  if (fs.existsSync(path.resolve(backendDir, 'venv/Scripts/python.exe'))) {
    pythonCmd = path.resolve(backendDir, 'venv/Scripts/python.exe');
  } else if (fs.existsSync(path.resolve(backendDir, 'venv/bin/python'))) {
    pythonCmd = path.resolve(backendDir, 'venv/bin/python');
  }

  try {
    execSync(`${pythonCmd} create_db.py`, {
      cwd: backendDir,
      stdio: 'inherit'
    });
  } finally {
    fs.unlinkSync(tempDbScriptPath);
  }

  const rootDir = path.resolve(__dirname, '../../');
  
  // Run Alembic migrations
  console.log('2. Running Alembic migrations...');
  let alembicCmd = 'alembic';
  if (fs.existsSync(path.resolve(backendDir, 'venv/Scripts/alembic.exe'))) {
    alembicCmd = 'backend\\\\venv\\\\Scripts\\\\alembic';
  } else if (fs.existsSync(path.resolve(backendDir, 'venv/bin/alembic'))) {
    alembicCmd = 'backend/venv/bin/alembic';
  }
  
  execSync(`${alembicCmd} upgrade head`, {
    cwd: rootDir,
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'inherit'
  });

  // Seed Admin and Employee users directly using a python script
  console.log('3. Seeding test users and inventory...');
  const pythonScript = `
import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from app.models.catalog import Category, Product, GoldPrice
from app.models.inventory import InventoryItem, ItemStatus
from app.core import security
from decimal import Decimal

db = SessionLocal()

# Create Admin
admin = User(
    username="admin@test.com",
    email="admin@test.com",
    hashed_password=security.get_password_hash("Password123!"),
    role="admin",
    is_active=True
)
db.add(admin)

# Create Employee
emp = User(
    username="employee@test.com",
    email="employee@test.com",
    hashed_password=security.get_password_hash("Password123!"),
    role="employee",
    is_active=True
)
db.add(emp)
db.commit()

# Seed Catalog
cat = Category(name="Test Category")
db.add(cat)
db.commit()
db.refresh(cat)

prod = Product(name="Test Gold Ring", category_id=cat.id)
db.add(prod)
db.commit()
db.refresh(prod)

# Seed Gold Price
gp = GoldPrice(karat=24, price_per_gram=Decimal("200.00"), created_by_id=admin.id)
db.add(gp)
db.commit()

# Seed Inventory
item1 = InventoryItem(
    sku="TEST-001",
    product_id=prod.id,
    weight=Decimal("10.00"),
    karat=24,
    manufacturing_fee=Decimal("50.00"),
    cost_basis=Decimal("1000.00"),
    status=ItemStatus.AVAILABLE
)
item2 = InventoryItem(
    sku="TEST-002",
    product_id=prod.id,
    weight=Decimal("5.00"),
    karat=24,
    manufacturing_fee=Decimal("25.00"),
    cost_basis=Decimal("500.00"),
    status=ItemStatus.AVAILABLE
)
item3 = InventoryItem(
    sku="TEST-003",
    product_id=prod.id,
    weight=Decimal("8.00"),
    karat=24,
    manufacturing_fee=Decimal("40.00"),
    cost_basis=Decimal("800.00"),
    status=ItemStatus.AVAILABLE
)
db.add(item1)
db.add(item2)
db.add(item3)
db.commit()

# Seed a completed sale for refund tests
from app.models.sales import Sale, Payment, Invoice, InvoiceItem

# item2 will be the sold item
item2.status = ItemStatus.SOLD
db.add(item2)

sale = Sale(
    total_amount=Decimal("525.00"),
    status="COMPLETED",
    user_id=admin.id,
    idempotency_key="test-refund-seeded"
)
db.add(sale)
db.commit()

payment = Payment(
    sale_id=sale.id,
    amount=Decimal("525.00"),
    method="CASH"
)
db.add(payment)

invoice = Invoice(
    sale_id=sale.id,
    invoice_number="INV-TEST-999"
)
db.add(invoice)
db.commit()

inv_item = InvoiceItem(
    invoice_id=invoice.id,
    inventory_item_id=item2.id,
    historical_karat=24,
    historical_weight=Decimal("5.00"),
    historical_gold_price_per_gram=Decimal("200.00"),
    historical_manufacturing_fee=Decimal("25.00"),
    line_total=Decimal("525.00")
)
db.add(inv_item)
db.commit()

db.close()
print("Seeding complete.")
  `;

  // Write temporary python script
  const tempScriptPath = path.resolve(backendDir, 'seed_test_db.py');
  fs.writeFileSync(tempScriptPath, pythonScript);

  try {
    // Run python script inside backend venv
    let pythonCmd = 'python';
    if (fs.existsSync(path.resolve(backendDir, 'venv/Scripts/python.exe'))) {
      pythonCmd = path.resolve(backendDir, 'venv/Scripts/python.exe');
    } else if (fs.existsSync(path.resolve(backendDir, 'venv/bin/python'))) {
      pythonCmd = path.resolve(backendDir, 'venv/bin/python');
    }
    
    execSync(`${pythonCmd} seed_test_db.py`, {
      cwd: backendDir,
      env: { ...process.env, DATABASE_URL: testDbUrl, PYTHONPATH: backendDir },
      stdio: 'inherit'
    });
  } finally {
    fs.unlinkSync(tempScriptPath);
  }

  console.log('Global setup complete.');
}

export default globalSetup;
