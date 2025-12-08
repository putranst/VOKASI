import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from database import SessionLocal, engine
import sql_models as models
from sqlalchemy import text

def test_connection():
    try:
        db = SessionLocal()
        print("Database connection successful.")
        
        # Test simple query
        result = db.execute(text("SELECT 1"))
        print(f"Query result: {result.scalar()}")
        
        # Test model loading
        print("Testing model loading...")
        courses = db.query(models.Course).limit(1).all()
        print(f"Courses found: {len(courses)}")
        
        # Test KnowledgeNode (vector)
        print("Testing KnowledgeNode (vector)...")
        nodes = db.query(models.KnowledgeNode).limit(1).all()
        print(f"Nodes found: {len(nodes)}")
        
        db.close()
        print("All tests passed.")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_connection()
