import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from sql_models import User
from datetime import datetime

def add_admin():
    db = SessionLocal()
    try:
        email = "putra@tsea.asia"
        existing_user = db.query(User).filter(User.email == email).first()
        
        if existing_user:
            print(f"User {email} already exists. Updating role to admin.")
            existing_user.role = "admin"
            existing_user.full_name = "Putra (Admin)"
            db.commit()
        else:
            print(f"Creating new admin user {email}.")
            new_user = User(
                email=email,
                full_name="Putra (Admin)",
                role="admin",
                created_at=datetime.utcnow()
            )
            db.add(new_user)
            db.commit()
            print(f"User {email} created successfully.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_admin()
