from database import SessionLocal
from sql_models import CourseModule
import json

db = SessionLocal()
module = db.query(CourseModule).filter(CourseModule.title.like("%Conceiving Circular%")).first()

if module:
    print(f"Title: {module.title}")
    for block in module.content_blocks:
        print(f"\n[{block['type']}]")
        print(block['content'][:500]) # First 500 chars
else:
    print("Module not found")
db.close()
