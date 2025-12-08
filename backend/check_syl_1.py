from database import SessionLocal
from sql_models import Syllabus, SyllabusSection

db = SessionLocal()
syl = db.query(Syllabus).filter(Syllabus.id == 1).first()

if syl:
    print(f"Syllabus ID 1:")
    print(f"  Title: {syl.title}")
    print(f"  Overview: {syl.overview[:100] if syl.overview else 'EMPTY'}")
    print(f"  Learning Outcomes: {syl.learning_outcomes}")
    
    sections = db.query(SyllabusSection).filter(SyllabusSection.syllabus_id == 1).all()
    print(f"  Sections: {len(sections)}")
    for sec in sections[:3]:
        print(f"    - {sec.title}: {sec.topics}")
else:
    print("Syllabus ID 1 NOT FOUND")
