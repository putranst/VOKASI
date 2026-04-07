"""
Clean up incorrect project assignments and re-populate with correct data
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import get_db
import sql_models as models

db = next(get_db())

try:
    print("=" * 70)
    print("CLEANING UP INCORRECT PROJECT ASSIGNMENTS")
    print("=" * 70)
    
    # Get Prof. Mats
    mats = db.query(models.User).filter(models.User.email == "mats@uid.or.id").first()
    print(f"\nProf. Mats ID: {mats.id}")
    
    # Find and delete projects where Mats is incorrectly listed as student
    mats_projects = db.query(models.CDIOProject).filter(models.CDIOProject.user_id == mats.id).all()
    
    if mats_projects:
        print(f"\nFound {len(mats_projects)} projects where Mats is incorrectly listed as student")
        print("Deleting these projects and their related data...")
        
        for project in mats_projects:
            print(f"  - Deleting project {project.id}: {project.title}")
            
            # Delete related data (cascade should handle this, but let's be explicit)
            if project.charter:
                db.delete(project.charter)
            if project.blueprint:
                db.delete(project.blueprint)
            if project.implementation:
                db.delete(project.implementation)
            if project.deployment:
                db.delete(project.deployment)
            
            # Delete code snapshots
            snapshots = db.query(models.CodeSnapshot).filter(models.CodeSnapshot.project_id == project.id).all()
            for snapshot in snapshots:
                db.delete(snapshot)
            
            # Delete the project itself
            db.delete(project)
        
        db.commit()
        print(f"\n✓ Deleted {len(mats_projects)} incorrect projects")
    else:
        print("\n✓ No incorrect projects found")
    
    # Verify cleanup
    remaining_mats_projects = db.query(models.CDIOProject).filter(models.CDIOProject.user_id == mats.id).count()
    print(f"\nVerification: Projects with Mats as student: {remaining_mats_projects}")
    
    # Show correct projects
    student_projects = db.query(models.CDIOProject).filter(models.CDIOProject.user_id != mats.id).all()
    print(f"Remaining valid student projects: {len(student_projects)}")
    
    print("\n" + "=" * 70)
    print("CLEANUP COMPLETE")
    print("=" * 70)
    print("\nNext step: The populate_grading_queue.py script has already created")
    print("correct projects for the 6 students. The grading queue should now")
    print("show only real students.")
    
finally:
    db.close()
