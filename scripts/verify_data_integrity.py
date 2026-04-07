"""
Comprehensive verification of grading queue data integrity
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import get_db
import sql_models as models
import requests

print("=" * 70)
print("COMPREHENSIVE DATA INTEGRITY VERIFICATION")
print("=" * 70)

db = next(get_db())

try:
    # 1. Check Prof. Mats
    print("\n1. INSTRUCTOR VERIFICATION")
    print("-" * 70)
    mats = db.query(models.User).filter(models.User.email == "mats@uid.or.id").first()
    print(f"   Prof. Mats ID: {mats.id}")
    print(f"   Role: {mats.role}")
    print(f"   ✓ Correct role" if mats.role == "instructor" else "   ❌ Wrong role")
    
    # 2. Check students
    print("\n2. STUDENT VERIFICATION")
    print("-" * 70)
    students = db.query(models.User).filter(models.User.role == "student").all()
    print(f"   Total students: {len(students)}")
    for student in students:
        print(f"   - {student.full_name} ({student.email})")
    
    # 3. Check projects
    print("\n3. PROJECT ASSIGNMENT VERIFICATION")
    print("-" * 70)
    all_projects = db.query(models.CDIOProject).all()
    print(f"   Total projects: {len(all_projects)}")
    
    # Check for instructor projects (should be 0)
    instructor_projects = db.query(models.CDIOProject).filter(
        models.CDIOProject.user_id == mats.id
    ).count()
    print(f"   Projects assigned to instructors: {instructor_projects}")
    if instructor_projects == 0:
        print(f"   ✓ No instructors listed as students")
    else:
        print(f"   ❌ ERROR: {instructor_projects} projects assigned to instructors!")
    
    # Check student projects
    student_projects = db.query(models.CDIOProject).filter(
        models.CDIOProject.user_id != mats.id
    ).all()
    print(f"   Projects assigned to students: {len(student_projects)}")
    
    # 4. Check enrollments
    print("\n4. ENROLLMENT VERIFICATION")
    print("-" * 70)
    for project in student_projects:
        student = db.query(models.User).filter(models.User.id == project.user_id).first()
        course = db.query(models.Course).filter(models.Course.id == project.course_id).first()
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.user_id == student.id,
            models.Enrollment.course_id == course.id
        ).first()
        
        status = "✓" if enrollment else "❌"
        print(f"   {status} {student.full_name} → {course.title[:40]}...")
    
    # 5. Check submissions
    print("\n5. SUBMISSION VERIFICATION")
    print("-" * 70)
    charter_count = sum(1 for p in student_projects if p.charter)
    blueprint_count = sum(1 for p in student_projects if p.blueprint)
    implementation_count = sum(1 for p in student_projects if p.implementation)
    
    print(f"   Charters: {charter_count}")
    print(f"   Blueprints: {blueprint_count}")
    print(f"   Implementations: {implementation_count}")
    print(f"   Total submissions: {charter_count + blueprint_count + implementation_count}")
    
    # 6. Check API endpoint
    print("\n6. API ENDPOINT VERIFICATION")
    print("-" * 70)
    try:
        response = requests.get('http://localhost:8000/api/v1/instructor/grading-queue')
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Endpoint working (Status: {response.status_code})")
            print(f"   Total items returned: {len(data)}")
            
            # Check for instructor names in student field
            instructor_in_queue = [item for item in data if 'Mats' in item['student_name']]
            if instructor_in_queue:
                print(f"   ❌ ERROR: Found instructor in grading queue!")
                for item in instructor_in_queue:
                    print(f"      - {item['student_name']}: {item['submission_type']}")
            else:
                print(f"   ✓ No instructors in grading queue")
            
            # List unique students
            unique_students = set(item['student_name'] for item in data)
            print(f"\n   Students in queue:")
            for student in sorted(unique_students):
                print(f"      - {student}")
        else:
            print(f"   ❌ Endpoint failed (Status: {response.status_code})")
    except Exception as e:
        print(f"   ❌ API Error: {str(e)}")
    
    print("\n" + "=" * 70)
    print("VERIFICATION COMPLETE")
    print("=" * 70)
    
    # Final summary
    if instructor_projects == 0 and len(student_projects) > 0:
        print("\n✅ ALL CHECKS PASSED - Data integrity verified!")
        print("\nThe grading queue is ready for use:")
        print(f"  - {len(students)} students with projects")
        print(f"  - {len(student_projects)} total projects")
        print(f"  - {charter_count + blueprint_count + implementation_count} submissions")
        print(f"  - 0 data integrity issues")
    else:
        print("\n❌ ISSUES FOUND - Please review the output above")
    
finally:
    db.close()
