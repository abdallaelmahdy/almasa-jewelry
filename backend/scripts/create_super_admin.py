import os
import sys
import getpass
import re

# Ensure the script runs in the correct environment
if not os.environ.get("DATABASE_URL"):
    print("ERROR: DATABASE_URL environment variable is not set.")
    print("To protect against accidentally modifying the wrong database, you must explicitly set DATABASE_URL.")
    print("Example: set DATABASE_URL=postgresql://user:pass@localhost:5432/almasa_jewelry")
    sys.exit(1)

# Ensure backend directory is in path for imports
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.session import SessionLocal
from app.models.user import User
from app.core import security

def is_valid_email(email: str) -> bool:
    return re.match(r"[^@]+@[^@]+\.[^@]+", email) is not None

def create_super_admin():
    print("=" * 50)
    print("ALMASA JEWELRY - SUPER ADMIN BOOTSTRAP")
    print("=" * 50)
    print(f"Target Database: {os.environ.get('DATABASE_URL')}")
    print("-" * 50)

    username = input("Enter admin username: ").strip()
    if not username:
        print("ERROR: Username cannot be empty.")
        sys.exit(1)

    email = input("Enter admin email: ").strip()
    if not email or not is_valid_email(email):
        print("ERROR: Invalid email address.")
        sys.exit(1)

    password = getpass.getpass("Enter admin password: ")
    if len(password) < 8:
        print("ERROR: Password must be at least 8 characters long.")
        sys.exit(1)

    password_confirm = getpass.getpass("Confirm admin password: ")
    if password != password_confirm:
        print("ERROR: Passwords do not match.")
        sys.exit(1)

    print("\nConnecting to database...")
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            print(f"ERROR: A user with username '{username}' or email '{email}' already exists.")
            sys.exit(1)

        hashed_password = security.get_password_hash(password)
        admin_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role="admin",
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("\nSUCCESS: Super admin created successfully.")
        print(f"Admin ID: {admin_user.id}")
        print(f"Username: {admin_user.username}")
        print(f"Role: {admin_user.role}")
        print("You may now log in to the system.")
        
    except Exception as e:
        db.rollback()
        print(f"\nERROR: Failed to create super admin. Details: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()
