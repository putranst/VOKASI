
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from backend.database import SessionLocal, engine
from backend import sql_models as models
from backend import models as schemas

def test_write():
    print("Testing SQLAlchemy Write...")
    db = SessionLocal()
    
    try:
        # Create a dummy project because of FK
        print("Creating dummy project...")
        proj = models.CDIOProject(
            course_id=999,
            user_id=1,
            title="Temp Test Project",
            current_phase="iterate",
            overall_status="in_progress",
            completion_percentage=0
        )
        db.add(proj)
        db.commit()
        db.refresh(proj)
        print(f"Project created with ID: {proj.id}")
        
        # Now create implementation
        print("Creating implementation...")
        impl = models.Implementation(
            project_id=proj.id,
            iteration_number=5,
            hypothesis="Testing SQLAlchemy Write",
            learnings="It should work",
            next_hypothesis="Hopefully",
            ai_feedback={"grade": "A"}
        )
        db.add(impl)
        db.commit()
        print("SUCCESS: Implementation created and committed.")
        
        # Verify read
        db.refresh(impl)
        print(f"Read back hypothesis: {impl.hypothesis}")
        print(f"Read back ai_feedback: {impl.ai_feedback}")
        
        # Cleanup
        db.delete(impl)
        db.delete(proj)
        db.commit()
        print("Cleanup done.")
        
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_write()
