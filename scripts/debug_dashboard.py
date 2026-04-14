import sys
import os
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import SessionLocal
from main import get_student_dashboard
from fastapi import HTTPException

def debug_dashboard(user_id):
    db = SessionLocal()
    try:
        print(f"Fetching dashboard for user {user_id}...")
        dashboard_data = get_student_dashboard(user_id=user_id, db=db)
        print("Success!")
        print(dashboard_data)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_dashboard(7)
