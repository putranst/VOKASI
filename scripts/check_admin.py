import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from sql_models import User

def check_user():
    db = SessionLocal()
    try:
        email = "putra@tsea.asia"
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"User found: ID={user.id}, Email={user.email}, Role={user.role}")
        else:
            print(f"User {email} NOT found.")
            
        # List all users to be sure
        print("\nAll users:")
        users = db.query(User).all()
        for u in users:
            print(f"- {u.email} ({u.role})")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_user()
