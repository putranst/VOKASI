import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from sql_models import User
from datetime import datetime
from hashlib import sha256

def hash_password_sha256(password: str) -> str:
    """Hash password using SHA256 (compatible with demo_login)."""
    return sha256(password.encode("utf-8")).hexdigest()

def add_admin():
    db = SessionLocal()
    try:
        email = "poetra@gmail.com"
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            print(f"User {email} already exists. Deleting and recreating with proper credentials.")
            db.delete(existing_user)
            db.commit()

        print(f"Creating new admin user {email}.")
        # For demo_login compatibility, we use password "test" which is hardcoded
        # The demo_login logic: matches_demo_password = (password == "test")
        # Setting password_hash to None ensures only "test" password works
        new_user = User(
            email=email,
            full_name="Poetra (Admin)",
            role="admin",
            password_hash=None,  # Only "test" password will work
            created_at=datetime.utcnow()
        )
        db.add(new_user)
        db.commit()
        print(f"User {email} created successfully.")
        print(f"Password: test")
        print(f"\nNOTE: The demo_login endpoint accepts 'test' as password for all users.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    add_admin()
