from database import SessionLocal
from sql_models import Course
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

def check_db(db_name):
    print(f"Checking {db_name}...")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, db_name)}"
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        courses = db.query(Course).all()
        print(f"  Count: {len(courses)}")
        if len(courses) > 0:
             print(f"  First: {courses[0].title}")
    except Exception as e:
        print(f"  Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_db("sql_app.db")
    check_db("sql_app_v2.db")
    check_db("sql_app_v3.db")
