import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from sql_models import User

def dump_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        with open('users_table.txt', 'w', encoding='utf-8') as f:
            f.write(f"| {'ID':<3} | {'Role':<12} | {'Name':<20} | {'Email':<30} |\n")
            f.write(f"|{'-'*5}|{'-'*14}|{'-'*22}|{'-'*32}|\n")
            for u in users:
                f.write(f"| {u.id:<3} | {u.role:<12} | {u.full_name:<20} | {u.email:<30} |\n")
        print("Successfully wrote to users_table.txt")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    dump_users()
