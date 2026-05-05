import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from sql_models import User

def check_user():
    db = SessionLocal()
    try:
        email = "poetra@gmail.com"
        user = db.query(User).filter(User.email == email).first()

        if user:
            print(f"User found: ID={user.id}, Email={user.email}, Role={user.role}")
            print(f"Password hash repr: {repr(user.password_hash)}")
            print(f"Password hash bool: {bool(user.password_hash)}")
            print(f"Password hash len: {len(user.password_hash) if user.password_hash else 0}")
        else:
            print(f"User {email} NOT found.")

        # List all users
        print("\nAll users in database:")
        users = db.query(User).all()
        for u in users:
            print(f"- {u.email} (ID={u.id}, Role={u.role}, hash={repr(u.password_hash)[:30] if u.password_hash else 'None'}...)")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_user()
