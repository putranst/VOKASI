from sqlalchemy.orm import Session
from database import SessionLocal
import sql_models as models
from mock_db import IDCounter

def debug_relationships():
    db = SessionLocal()
    try:
        print("--- Relationship Debugger ---")
        projects = db.query(models.CDIOProject).all()
        print(f"Total Projects: {len(projects)}")
        
        for p in projects:
            print(f"\nProject ID: {p.id}")
            print(f"Title: {p.title}")
            print(f"Course ID: {p.course_id}")
            
            # Check relationships explicitly
            print(f"Charter: {p.charter}")
            print(f"Blueprint: {p.blueprint}")
            print(f"Implementation: {p.implementation}")
            
            # If None, try finding orphans
            if p.charter is None:
                orphan_charter = db.query(models.ProjectCharter).filter(models.ProjectCharter.project_id == p.id).first()
                print(f"  -> Orphaned Charter found? {orphan_charter is not None}")
                if orphan_charter:
                     print(f"     ID: {orphan_charter.id}, Project ID: {orphan_charter.project_id}")

            if p.blueprint is None:
                orphan_blueprint = db.query(models.DesignBlueprint).filter(models.DesignBlueprint.project_id == p.id).first()
                print(f"  -> Orphaned Blueprint found? {orphan_blueprint is not None}")

    finally:
        db.close()

if __name__ == "__main__":
    debug_relationships()
