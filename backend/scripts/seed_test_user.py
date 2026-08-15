import os
import sys

# Append backend to path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import engine, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
import uuid

def seed():
    db = SessionLocal()
    # Check if admin@test.com exists
    user = db.query(User).filter(User.username == 'admin@test.com').first()
    if not user:
        new_admin = User(
            username="admin@test.com",
            email="admin@test.com",
            hashed_password=get_password_hash("Password123!"),
            role="admin",
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print("Admin user created.")
    else:
        # Just update password
        user.hashed_password = get_password_hash("Password123!")
        db.commit()
        print("Admin user already existed, password updated.")
    
    db.close()

if __name__ == "__main__":
    seed()
