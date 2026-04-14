"""
Populate Grading Queue for Prof. Mats (mats@uid.or.id)
Creates 5-6 realistic student submissions with complete data synchronization.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy.orm import Session
from database import get_db, engine
import sql_models as models
from datetime import datetime, timedelta
import random

def populate_grading_queue(db: Session):
    """
    Populate grading queue with 5-6 student submissions for Prof. Mats.
    Ensures all data is synced across users, projects, enrollments, and submissions.
    """
    
    print("=" * 60)
    print("POPULATING GRADING QUEUE FOR PROF. MATS")
    print("=" * 60)
    
    # 1. Get Prof. Mats
    mats = db.query(models.User).filter(models.User.email == "mats@uid.or.id").first()
    if not mats:
        print("ERROR: Prof. Mats not found. Please run seed_data first.")
        return
    
    print(f"✓ Found Prof. Mats (ID: {mats.id})")
    
    # 2. Get Mats' courses
    mats_courses = db.query(models.Course).filter(models.Course.instructor_id == mats.id).all()
    if not mats_courses:
        print("ERROR: No courses found for Prof. Mats.")
        return
    
    print(f"✓ Found {len(mats_courses)} courses taught by Prof. Mats")
    
    # 3. Create/Get Student Users
    student_data = [
        {"email": "alice.tan@student.edu", "name": "Alice Tan", "institution": "NUS"},
        {"email": "bob.chen@student.edu", "name": "Bob Chen", "institution": "NTU"},
        {"email": "charlie.wong@student.edu", "name": "Charlie Wong", "institution": "SMU"},
        {"email": "diana.lim@student.edu", "name": "Diana Lim", "institution": "SUTD"},
        {"email": "ethan.kumar@student.edu", "name": "Ethan Kumar", "institution": "NUS"},
        {"email": "fiona.ng@student.edu", "name": "Fiona Ng", "institution": "NTU"}
    ]
    
    students = []
    for s_data in student_data:
        student = db.query(models.User).filter(models.User.email == s_data["email"]).first()
        if not student:
            student = models.User(
                email=s_data["email"],
                full_name=s_data["name"],
                role="student",
                password_hash="hashed_password"
            )
            db.add(student)
            db.commit()
            db.refresh(student)
            print(f"  ✓ Created student: {s_data['name']}")
        else:
            print(f"  ✓ Found existing student: {s_data['name']}")
        students.append(student)
    
    # 4. Create Projects and Submissions
    submission_types = ["charter", "blueprint", "implementation"]
    phases = ["conceive", "design", "iterate"]
    
    submissions_created = 0
    
    for idx, student in enumerate(students):
        # Pick a course (cycle through Mats' courses)
        course = mats_courses[idx % len(mats_courses)]
        
        # Check if enrollment exists
        enrollment = db.query(models.Enrollment).filter(
            models.Enrollment.user_id == student.id,
            models.Enrollment.course_id == course.id
        ).first()
        
        if not enrollment:
            enrollment = models.Enrollment(
                user_id=student.id,
                course_id=course.id,
                status="active",
                enrolled_at=datetime.utcnow() - timedelta(days=random.randint(10, 30))
            )
            db.add(enrollment)
            db.commit()
            print(f"  ✓ Enrolled {student.full_name} in {course.title}")
        
        # Create project
        project = db.query(models.CDIOProject).filter(
            models.CDIOProject.user_id == student.id,
            models.CDIOProject.course_id == course.id
        ).first()
        
        if not project:
            submission_type = submission_types[idx % len(submission_types)]
            phase = phases[idx % len(phases)]
            
            project = models.CDIOProject(
                course_id=course.id,
                user_id=student.id,
                title=f"{course.title[:30]} - {student.full_name.split()[0]}'s Project",
                current_phase=phase,
                overall_status="under_review",
                completion_percentage=random.randint(25, 75),
                created_at=datetime.utcnow() - timedelta(days=random.randint(5, 20)),
                updated_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                last_activity_at=datetime.utcnow() - timedelta(hours=random.randint(1, 12))
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            
            # Add phase-specific content
            if submission_type == "charter" or idx % 3 == 0:
                charter = models.ProjectCharter(
                    project_id=project.id,
                    problem_statement=f"Address the challenge of {['digital transformation', 'sustainability', 'data governance', 'AI adoption', 'smart city integration'][idx % 5]} in {['SMEs', 'government agencies', 'educational institutions', 'healthcare', 'manufacturing'][idx % 5]}. Current solutions are inadequate due to lack of {['technical expertise', 'funding', 'stakeholder buy-in', 'regulatory clarity', 'infrastructure'][idx % 5]}.",
                    success_metrics=f"Achieve {random.randint(15, 40)}% improvement in {['efficiency', 'cost reduction', 'user satisfaction', 'compliance', 'scalability'][idx % 5]} within {random.randint(3, 12)} months. Measure through {['KPIs', 'surveys', 'analytics', 'audits', 'benchmarks'][idx % 5]}.",
                    target_outcome=f"Deliver a {['proof-of-concept', 'MVP', 'pilot program', 'full deployment', 'framework'][idx % 5]} that demonstrates {['feasibility', 'ROI', 'scalability', 'compliance', 'innovation'][idx % 5]}.",
                    constraints=f"Budget: ${random.randint(10, 100)}k, Timeline: {random.randint(3, 12)} months, Team: {random.randint(2, 8)} people",
                    stakeholders=f"{['C-suite executives', 'Department heads', 'End users', 'Regulatory bodies', 'Technology partners'][idx % 5]}, {['IT team', 'Operations', 'Finance', 'Legal', 'HR'][idx % 5]}",
                    suggested_tools=["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
                    reasoning="Selected based on scalability, community support, and alignment with organizational tech stack.",
                    difficulty_level=["Intermediate", "Advanced", "Expert"][idx % 3],
                    estimated_duration=f"{random.randint(8, 16)} weeks",
                    created_at=datetime.utcnow() - timedelta(days=random.randint(3, 15)),
                    updated_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
                )
                db.add(charter)
                print(f"    ✓ Created Charter for {student.full_name}")
            
            if submission_type == "blueprint" or idx % 3 == 1:
                blueprint = models.DesignBlueprint(
                    project_id=project.id,
                    architecture_diagram={
                        "nodes": [
                            {"id": "frontend", "label": "React Frontend", "type": "client"},
                            {"id": "api", "label": "FastAPI Backend", "type": "server"},
                            {"id": "db", "label": "PostgreSQL", "type": "database"},
                            {"id": "cache", "label": "Redis Cache", "type": "cache"}
                        ],
                        "edges": [
                            {"from": "frontend", "to": "api", "label": "REST API"},
                            {"from": "api", "to": "db", "label": "SQL Queries"},
                            {"from": "api", "to": "cache", "label": "Cache Layer"}
                        ]
                    },
                    logic_flow=f"User → Authentication → {['Dashboard', 'Data Entry', 'Analytics', 'Reporting', 'Admin Panel'][idx % 5]} → Backend Processing → Database → Response → UI Update",
                    component_list=[
                        "Frontend: React + TypeScript + Tailwind",
                        "Backend: FastAPI + Pydantic + SQLAlchemy",
                        "Database: PostgreSQL with pgvector",
                        "Caching: Redis for session management",
                        "Deployment: Docker + Nginx + Let's Encrypt"
                    ],
                    created_at=datetime.utcnow() - timedelta(days=random.randint(2, 10)),
                    updated_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
                )
                db.add(blueprint)
                print(f"    ✓ Created Blueprint for {student.full_name}")
            
            if submission_type == "implementation" or idx % 3 == 2:
                implementation = models.Implementation(
                    project_id=project.id,
                    iteration_number=random.randint(1, 3),
                    hypothesis=f"Implementing {['microservices architecture', 'event-driven design', 'serverless functions', 'GraphQL API', 'real-time sync'][idx % 5]} will improve {['performance', 'scalability', 'maintainability', 'user experience', 'cost efficiency'][idx % 5]}.",
                    learnings=f"Discovered that {['caching strategy', 'database indexing', 'API design', 'error handling', 'testing approach'][idx % 5]} significantly impacts {['response time', 'reliability', 'developer experience', 'deployment speed', 'bug rate'][idx % 5]}. Need to refine {['data models', 'authentication flow', 'state management', 'CI/CD pipeline', 'monitoring'][idx % 5]}.",
                    code_repository_url=f"https://github.com/{student.full_name.lower().replace(' ', '-')}/project-{idx+1}",
                    code_snapshot=f"""# {course.title} - Implementation
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="{course.title[:30]} API")

class DataModel(BaseModel):
    id: int
    name: str
    value: float

@app.get("/")
async def root():
    return {{"message": "API is running", "version": "1.0.0"}}

@app.post("/process")
async def process_data(data: DataModel):
    # Process data logic here
    result = data.value * {random.uniform(1.1, 2.5):.2f}
    return {{"processed": True, "result": result}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
""",
                    next_hypothesis=f"Next iteration will focus on {['optimization', 'security hardening', 'feature expansion', 'refactoring', 'testing coverage'][idx % 5]}.",
                    ai_feedback={
                        "grade": ["A-", "B+", "A", "B", "A-"][idx % 5],
                        "score": random.randint(75, 95),
                        "strengths": [
                            f"Well-structured {['code organization', 'API design', 'error handling', 'documentation', 'testing'][idx % 5]}",
                            f"Good use of {['async patterns', 'type hints', 'design patterns', 'best practices', 'modern libraries'][idx % 5]}"
                        ],
                        "areas_for_improvement": [
                            f"Consider adding {['input validation', 'logging', 'rate limiting', 'caching', 'monitoring'][idx % 5]}",
                            f"Improve {['test coverage', 'documentation', 'error messages', 'performance', 'security'][idx % 5]}"
                        ],
                        "feedback": f"Strong implementation demonstrating {['technical competence', 'problem-solving skills', 'attention to detail', 'best practices', 'innovation'][idx % 5]}. The code is {['well-organized', 'efficient', 'maintainable', 'scalable', 'secure'][idx % 5]} and shows good understanding of {['async programming', 'API design', 'data modeling', 'error handling', 'testing'][idx % 5]}."
                    },
                    security_check_passed=random.choice([True, True, False]),
                    linting_passed=random.choice([True, True, True, False]),
                    tests_passed=random.choice([True, True, False]),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 7)),
                    updated_at=datetime.utcnow() - timedelta(hours=random.randint(1, 12))
                )
                db.add(implementation)
                print(f"    ✓ Created Implementation for {student.full_name}")
            
            submissions_created += 1
            print(f"  ✓ Created project for {student.full_name} in {course.title}")
    
    db.commit()
    
    print("\n" + "=" * 60)
    print(f"✓ GRADING QUEUE POPULATED SUCCESSFULLY")
    print(f"  - {len(students)} students created/verified")
    print(f"  - {submissions_created} projects with submissions created")
    print(f"  - All data synced across users, enrollments, and projects")
    print("=" * 60)
    
    # Verify the data
    print("\nVERIFICATION:")
    for student in students:
        projects = db.query(models.CDIOProject).filter(models.CDIOProject.user_id == student.id).all()
        for project in projects:
            course = db.query(models.Course).filter(models.Course.id == project.course_id).first()
            print(f"  • {student.full_name}: {project.title[:40]}... ({project.current_phase})")
            if project.charter:
                print(f"    - Charter: ✓")
            if project.blueprint:
                print(f"    - Blueprint: ✓")
            if project.implementation:
                print(f"    - Implementation: ✓")

if __name__ == "__main__":
    db = next(get_db())
    try:
        populate_grading_queue(db)
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()
