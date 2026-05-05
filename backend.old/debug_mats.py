from database import SessionLocal
from sql_models import User, Course, CDIOProject, ProjectCharter, Enrollment

db = SessionLocal()

print("=== DEBUGGING MATS DASHBOARD ===\n")

# 1. Check Mats user
mats = db.query(User).filter(User.email == "mats@uid.or.id").first()
print(f"1. Mats User:")
print(f"   Email: {mats.email if mats else 'NOT FOUND'}")
print(f"   Full Name: {mats.full_name if mats else 'NOT FOUND'}")
print(f"   Role: {mats.role if mats else 'NOT FOUND'}\n")

# 2. Check courses for Mats Hanson
courses = db.query(Course).filter(Course.instructor == "Mats Hanson").all()
print(f"2. Courses for 'Mats Hanson':")
for c in courses:
    print(f"   - ID: {c.id}, Title: {c.title}, Instructor: {c.instructor}")
print()

# 3. Check projects for these courses
for course in courses:
    projects = db.query(CDIOProject).filter(CDIOProject.course_id == course.id).all()
    print(f"3. Projects in '{course.title}' (ID: {course.id}):")
    for p in projects:
        charter = db.query(ProjectCharter).filter(ProjectCharter.project_id == p.id).first()
        print(f"   - Project ID: {p.id}, Title: {p.title}, Phase: {p.current_phase}")
        print(f"     User ID: {p.user_id}, Charter: {'Yes' if charter else 'No'}")
    print()

# 4. Check enrollments
enrollments = db.query(Enrollment).join(Course).filter(Course.instructor == "Mats Hanson").all()
print(f"4. Total Enrollments in Mats' courses: {len(enrollments)}")
for e in enrollments:
    user = db.query(User).filter(User.id == e.user_id).first()
    course = db.query(Course).filter(Course.id == e.course_id).first()
    print(f"   - {user.full_name} enrolled in '{course.title}'")

db.close()
print("\n=== DEBUG COMPLETE ===")
