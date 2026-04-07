"""
Verify grading queue data synchronization
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy.orm import Session
from database import get_db
import sql_models as models

def verify_grading_queue():
    db = next(get_db())
    
    try:
        # Get Prof. Mats
        mats = db.query(models.User).filter(models.User.email == "mats@uid.or.id").first()
        print(f"\n{'='*70}")
        print(f"GRADING QUEUE VERIFICATION FOR PROF. MATS (ID: {mats.id})")
        print(f"{'='*70}\n")
        
        # Get all projects for Mats' courses
        mats_courses = db.query(models.Course).filter(models.Course.instructor_id == mats.id).all()
        course_ids = [c.id for c in mats_courses]
        
        projects = db.query(models.CDIOProject).filter(
            models.CDIOProject.course_id.in_(course_ids)
        ).all()
        
        print(f"Total submissions in grading queue: {len(projects)}\n")
        
        for idx, project in enumerate(projects, 1):
            student = db.query(models.User).filter(models.User.id == project.user_id).first()
            course = db.query(models.Course).filter(models.Course.id == project.course_id).first()
            enrollment = db.query(models.Enrollment).filter(
                models.Enrollment.user_id == student.id,
                models.Enrollment.course_id == course.id
            ).first()
            
            print(f"{idx}. {student.full_name} ({student.email})")
            print(f"   Course: {course.title}")
            print(f"   Project: {project.title}")
            print(f"   Phase: {project.current_phase} | Status: {project.overall_status}")
            print(f"   Progress: {project.completion_percentage}%")
            print(f"   Enrollment Status: {enrollment.status if enrollment else 'NOT ENROLLED'}")
            
            # Check submissions
            submissions = []
            if project.charter:
                submissions.append(f"Charter (Problem: {project.charter.problem_statement[:50]}...)")
            if project.blueprint:
                submissions.append(f"Blueprint ({len(project.blueprint.component_list)} components)")
            if project.implementation:
                submissions.append(f"Implementation (Iteration {project.implementation.iteration_number}, Grade: {project.implementation.ai_feedback.get('grade', 'N/A') if project.implementation.ai_feedback else 'N/A'})")
            
            print(f"   Submissions: {', '.join(submissions) if submissions else 'None'}")
            print(f"   Last Activity: {project.last_activity_at}")
            print()
        
        # Summary by phase
        print(f"{'='*70}")
        print("SUMMARY BY PHASE:")
        print(f"{'='*70}")
        charter_count = sum(1 for p in projects if p.charter)
        blueprint_count = sum(1 for p in projects if p.blueprint)
        implementation_count = sum(1 for p in projects if p.implementation)
        
        print(f"  Charter submissions: {charter_count}")
        print(f"  Blueprint submissions: {blueprint_count}")
        print(f"  Implementation submissions: {implementation_count}")
        print(f"  Total: {len(projects)}")
        print()
        
    finally:
        db.close()

if __name__ == "__main__":
    verify_grading_queue()
