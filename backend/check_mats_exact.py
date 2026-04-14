from database import SessionLocal
from sql_models import User, Course

db = SessionLocal()

print("=== CHECKING MATS DATA ===\n")

# 1. Check user
mats = db.query(User).filter(User.email == "mats@uid.or.id").first()
print(f"Mats User:")
print(f"  ID: {mats.id}")
print(f"  Email: {mats.email}")
print(f"  Full Name: {mats.full_name}")  # This is what goes into user.name
print(f"  Role: {mats.role}")
print()

# 2. Check courses
all_courses = db.query(Course).all()
print(f"Total courses in DB: {len(all_courses)}")
print()

mats_courses = db.query(Course).filter(Course.instructor == "Mats Hanson").all()
print(f"Courses with instructor='Mats Hanson': {len(mats_courses)}")
for course in mats_courses:
    print(f"  - ID: {course.id}")
    print(f"    Title: {course.title}")
    print(f"    Instructor: {course.instructor}")
    print(f"    Students Count: {course.students_count}")
    print()

# 3. Check if instructor field matches full_name
print(f"Does instructor field '{mats_courses[0].instructor if mats_courses else 'N/A'}' match user full_name '{mats.full_name}'?")
if mats_courses:
    print(f"  Match: {mats_courses[0].instructor == mats.full_name}")
print()

# 4. List all unique instructors
instructors = db.query(Course.instructor).distinct().all()
print("All instructor values in database:")
for inst in instructors:
    print(f"  - '{inst[0]}'")

db.close()
