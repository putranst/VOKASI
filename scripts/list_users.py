from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add backend directory to path so we can import models
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sql_models import User, Base

# Connect to the database
SQLALCHEMY_DATABASE_URL = "sqlite:///./backend/sql_app.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"{'ID':<5} {'Email':<30} {'Role':<15} {'Name':<20}")
        print("-" * 70)
        for user in users:
            print(f"{user.id:<5} {user.email:<30} {user.role:<15} {user.full_name:<20}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
