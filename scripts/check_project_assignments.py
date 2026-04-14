"""
Check for projects where Prof. Mats is incorrectly listed as a student
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import get_db
import sql_models as models

db = next(get_db())

try:
    # Get Prof. Mats
    mats = db.query(models.User).filter(models.User.email == "mats@uid.or.id").first()
    print(f"Prof. Mats ID: {mats.id}")
    print(f"Prof. Mats Role: {mats.role}")
    print()
    
    # Check all projects
    all_projects = db.query(models.CDIOProject).all()
    print(f"Total projects in database: {len(all_projects)}")
    print()
    
    # Find projects where Mats is the student
    mats_projects = db.query(models.CDIOProject).filter(models.CDIOProject.user_id == mats.id).all()
    print(f"Projects where Prof. Mats is listed as student: {len(mats_projects)}")
    
    if mats_projects:
        print("\nINCORRECT PROJECTS (Mats as student):")
        for p in mats_projects:
            course = db.query(models.Course).filter(models.Course.id == p.course_id).first()
            print(f"  - Project {p.id}: {p.title}")
            print(f"    Course: {course.title if course else 'Unknown'}")
            print(f"    User ID: {p.user_id} (should be a student, not Mats)")
            print()
    
    # Check student projects
    print("\nCORRECT PROJECTS (Real students):")
    student_projects = db.query(models.CDIOProject).filter(models.CDIOProject.user_id != mats.id).all()
    print(f"Total: {len(student_projects)}")
    
    for p in student_projects[:5]:  # Show first 5
        student = db.query(models.User).filter(models.User.id == p.user_id).first()
        course = db.query(models.Course).filter(models.Course.id == p.course_id).first()
        print(f"  - {student.full_name if student else 'Unknown'}: {p.title[:40]}...")
        print(f"    Course: {course.title if course else 'Unknown'}")
        print()
        
finally:
    db.close()
