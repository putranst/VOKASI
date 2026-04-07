from database import SessionLocal
from sql_models import User, Course, CourseModule, Syllabus

db = SessionLocal()
user = db.query(User).filter(User.email == "mats@uid.or.id").first()
print(f"User: {user.full_name}")

courses = db.query(Course).filter(Course.instructor == user.full_name).all()
for c in courses:
    print(f"\nCourse: {c.title}")
    # Check Syllabus
    syl = db.query(Syllabus).filter(Syllabus.course_id == c.id).first()
    if syl:
        print(f"  Syllabus: Found (Sections: {len(syl.sections)})")
    else:
        print(f"  Syllabus: NOT FOUND")

    # Check Modules
    modules = db.query(CourseModule).filter(CourseModule.course_id == c.id).all()
    print(f"  Modules: {len(modules)}")
    for m in modules:
        print(f"    - {m.title} (Blocks: {len(m.content_blocks)})")
        if len(m.content_blocks) > 0:
             print(f"      First Block: {m.content_blocks[0].get('content')[:50]}...")

db.close()
