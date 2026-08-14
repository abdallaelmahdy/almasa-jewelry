import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.main import app
from app.core.config import settings
from app.api.deps import get_db
from sqlalchemy import text

# We use the existing DB, but tests will rollback everything.
engine = create_engine(settings.DATABASE_URL)

from app.core.rate_limit import limiter

@pytest.fixture(scope="session", autouse=True)
def clear_db():
    """Clear database tables before running the entire test suite."""
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE users, refresh_sessions, audit_logs, customers, categories, products, gold_prices, sales, inventory_items, invoices, payments, inventory_transactions, invoice_items, refunds CASCADE"))

@pytest.fixture(scope="function", autouse=True)
def manage_rate_limits(request):
    """Disable rate limiting for all tests except test_rate_limiting."""
    if "test_rate_limiting" in request.node.name:
        limiter.enabled = True
    else:
        limiter.enabled = False
    yield
    limiter.enabled = True

@pytest.fixture(scope="function")
def db_session():
    """
    Creates a fresh sqlalchemy session for a test that operates within a transaction.
    The transaction is rolled back after the test completes, ensuring no state leakage.
    Uses nested transactions (savepoints) so app db.commit() doesn't commit the outer transaction.
    """
    connection = engine.connect()
    transaction = connection.begin()
    
    # join_transaction_mode="create_savepoint" ensures that when the app calls
    # db.commit(), it just commits a savepoint, keeping our outer transaction alive to be rolled back.
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session: Session):
    """
    Returns a TestClient that uses the transactional db_session.
    """
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def real_db_client():
    """
    Returns a TestClient that uses the actual connection pool without sharing a transaction.
    WARNING: Commits will actually persist to the test database. Manual cleanup required.
    """
    app.dependency_overrides.clear()
    with TestClient(app) as c:
        yield c

from app.models.user import User
from app.core import security

def create_user_helper(db_session, username, email, role):
    user = User(
        username=username,
        email=email,
        hashed_password=security.get_password_hash("StrongPassword123"),
        role=role,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def admin_token_headers(client: TestClient, db_session: Session):
    create_user_helper(db_session, "admin_fixt", "admin_fixt@test.com", "admin")
    resp = client.post("/api/v1/auth/login", data={"username": "admin_fixt", "password": "StrongPassword123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def normal_user_token_headers(client: TestClient, db_session: Session):
    create_user_helper(db_session, "emp_fixt", "emp_fixt@test.com", "employee")
    resp = client.post("/api/v1/auth/login", data={"username": "emp_fixt", "password": "StrongPassword123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
