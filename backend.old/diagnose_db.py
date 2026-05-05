from sqlalchemy.orm import Session
from database import SessionLocal, engine
import sql_models as models

def diagnose():
    db = SessionLocal()
    try:
        print("--- Database Diagnosis ---")
        user_count = db.query(models.User).count()
        print(f"Users: {user_count}")
        
        course_count = db.query(models.Course).count()
        print(f"Courses: {course_count}")
        
        projects_count = db.query(models.CDIOProject).count()
        print(f"Projects: {projects_count}")
        
        modules_count = db.query(models.CourseModule).count()
        print(f"Modules: {modules_count}")
        
        if course_count > 0:
            print("\nCourses Found:")
            for c in db.query(models.Course).all():
                print(f" - {c.id}: {c.title} (Instructor: {c.instructor})")
        
        if projects_count > 0:
            print("\nProjects Found:")
            for p in db.query(models.CDIOProject).all():
                print(f" - {p.id}: {p.title} (Status: {p.overall_status})")
                
    finally:
        db.close()

if __name__ == "__main__":
    diagnose()
