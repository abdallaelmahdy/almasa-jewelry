import pytest
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.models.auth import RefreshSession
from app.models.audit import AuditLog

def create_test_user(db_session, username="testadmin", email="admin@test.com", password="StrongPassword123", role="admin"):
    user = User(
        username=username,
        email=email,
        hashed_password=security.get_password_hash(password),
        role=role,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

def test_password_hashing():
    password = "StrongPassword123"
    hashed = security.get_password_hash(password)
    assert hashed != password
    assert security.verify_password(password, hashed)
    assert not security.verify_password("wrongpassword", hashed)

def test_login_success(client, db_session):
    create_test_user(db_session)
    response = client.post("/api/v1/auth/login", data={"username": "testadmin", "password": "StrongPassword123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "password" not in data
    assert "hashed_password" not in data
    assert "refresh_token" in response.cookies

def test_login_invalid_password(client, db_session):
    create_test_user(db_session, username="test2", email="test2@test.com")
    response = client.post("/api/v1/auth/login", data={"username": "test2", "password": "WrongPassword"})
    assert response.status_code == 401

def test_login_unknown_user(client):
    response = client.post("/api/v1/auth/login", data={"username": "unknown", "password": "password"})
    assert response.status_code == 401

def test_login_inactive_user(client, db_session):
    user = create_test_user(db_session, username="inactive", email="in@test.com")
    user.is_active = False
    db_session.commit()
    response = client.post("/api/v1/auth/login", data={"username": "inactive", "password": "StrongPassword123"})
    assert response.status_code == 401

def test_users_me(client, db_session):
    user = create_test_user(db_session, username="meuser", email="me@test.com")
    token = security.create_access_token(user.id, user.role)
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "meuser"
    assert "hashed_password" not in data

def test_expired_access_token(client, db_session):
    user = create_test_user(db_session, username="expuser", email="exp@test.com")
    expire = datetime.now(timezone.utc) - timedelta(minutes=5)
    to_encode = {"exp": expire, "sub": str(user.id), "role": user.role}
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401

def test_refresh_token_rotation_and_reuse(client, db_session):
    user = create_test_user(db_session, username="rotuser", email="rot@test.com")
    # Login
    login_resp = client.post("/api/v1/auth/login", data={"username": "rotuser", "password": "StrongPassword123"})
    first_cookie = login_resp.cookies.get("refresh_token")
    
    # 1. Successful Refresh
    client.cookies.set("refresh_token", first_cookie)
    refresh_resp = client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 200
    second_cookie = refresh_resp.cookies.get("refresh_token")
    assert first_cookie != second_cookie
    
    # 2. Reuse old token -> triggers revocation
    client.cookies.set("refresh_token", first_cookie)
    reuse_resp = client.post("/api/v1/auth/refresh")
    assert reuse_resp.status_code == 401
    
    # 3. New token also invalid now (since reuse revoked all sessions)
    client.cookies.set("refresh_token", second_cookie)
    third_resp = client.post("/api/v1/auth/refresh")
    assert third_resp.status_code == 401

def test_logout(client, db_session):
    create_test_user(db_session, username="logoutuser", email="lo@test.com")
    login_resp = client.post("/api/v1/auth/login", data={"username": "logoutuser", "password": "StrongPassword123"})
    client.cookies.set("refresh_token", login_resp.cookies.get("refresh_token"))
    
    logout_resp = client.post("/api/v1/auth/logout")
    assert logout_resp.status_code == 200
    
    refresh_resp = client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 401

def test_cookie_security_attributes(client, db_session):
    create_test_user(db_session, username="cookieuser", email="cookie@test.com")
    response = client.post("/api/v1/auth/login", data={"username": "cookieuser", "password": "StrongPassword123"}, headers={"X-Forwarded-For": "10.0.0.1"})
    cookie_header = response.headers.get("set-cookie")
    assert "HttpOnly" in cookie_header
    assert "SameSite=strict" in cookie_header
    assert "Path=/api/v1/auth" in cookie_header

def test_admin_vs_employee_authorization(client, db_session):
    admin = create_test_user(db_session, username="admin1", email="a1@test.com", role="admin")
    emp = create_test_user(db_session, username="emp1", email="e1@test.com", role="employee")
    
    admin_token = security.create_access_token(admin.id, admin.role)
    emp_token = security.create_access_token(emp.id, emp.role)
    
    # Employee cannot create user
    resp = client.post(
        "/api/v1/users", 
        json={"email": "new@test.com", "username": "new", "password": "StrongPassword123", "role": "employee"},
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    assert resp.status_code == 403
    
    # Admin can create user
    resp2 = client.post(
        "/api/v1/users", 
        json={"email": "new@test.com", "username": "new", "password": "StrongPassword123", "role": "employee"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp2.status_code == 200

def test_rate_limiting(client, db_session):
    create_test_user(db_session, username="rateuser", email="rate@test.com")
    # Need to simulate IP requests - fastAPI test client does this by default usually
    for i in range(5):
        resp = client.post("/api/v1/auth/login", data={"username": "rateuser", "password": "StrongPassword123"}, headers={"X-Forwarded-For": "10.0.0.2"})
        if resp.status_code == 429:
            break
    
    resp_limit = client.post("/api/v1/auth/login", data={"username": "rateuser", "password": "StrongPassword123"}, headers={"X-Forwarded-For": "10.0.0.2"})
    assert resp_limit.status_code == 429
