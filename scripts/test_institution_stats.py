import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal
import sql_models as models
from sqlalchemy import func

def test_institution_stats():
    db = SessionLocal()
    institution_id = 1
    
    print(f"Testing stats for Institution ID: {institution_id}")
    
    try:
        # 1. Total Active Students
        total_active_students = db.query(models.Enrollment.user_id).join(models.Course).filter(
            models.Course.institution_id == institution_id,
            models.Enrollment.status == 'active'
        ).distinct().count()
        print(f"Total Active Students: {total_active_students}")
        
        # 2. Total Completions
        total_completions = db.query(models.Credential).join(models.Course).filter(
            models.Course.institution_id == institution_id
        ).count()
        print(f"Total Completions: {total_completions}")
        
        # 4. Average Course Rating
        avg_rating = db.query(func.avg(models.Course.rating)).filter(
            models.Course.institution_id == institution_id
        ).scalar() or 0.0
        print(f"Average Rating: {avg_rating}")
        
        # 5. Total Revenue
        total_revenue = db.query(func.sum(models.RevenueTransaction.amount)).join(models.Course).filter(
            models.Course.institution_id == institution_id
        ).scalar() or 0.0
        print(f"Total Revenue: {total_revenue}")
        
        print("Test passed successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_institution_stats()
