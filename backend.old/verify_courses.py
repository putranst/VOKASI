from database import SessionLocal
from sql_models import Course

def verify_courses():
    db = SessionLocal()
    courses = db.query(Course).all()
    print(f"Total courses: {len(courses)}")
    for c in courses:
        print(f"ID: {c.id}, Title: {c.title}")
    db.close()

if __name__ == "__main__":
    verify_courses()
