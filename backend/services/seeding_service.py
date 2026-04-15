from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
import sql_models as models
import models as schemas
from mock_db import (
    IDCounter, QUIZZES_DB, NOTIFICATIONS_DB, CONVERSATIONS_DB, 
    CREDENTIALS_DB, clear_mock_db
)
from models import Quiz, QuizQuestion, DiscussionThread, Credential
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from seeds.ai_fundamentals_seed import seed_ai_fundamentals_content

def init_sample_data(db: Session, force: bool = False):
    """
    Initializes sample data for the application.
    If force=True, it will wipe existing data and reseed everything.
    """
    print(f"DEBUG: init_sample_data called (force={force})")

    if force:
        print("WARN: Force reset requested. Wiping data...")
        clear_mock_db()
        # Clear SQL Tables (Order matters for Foreign Keys)
        # Note: In production, rely on CASCADE or separate delete calls
        try:
            db.query(models.Credential).delete()
            db.query(models.Deployment).delete()
            db.query(models.Implementation).delete()
            db.query(models.DesignBlueprint).delete()
            db.query(models.ProjectCharter).delete()
            db.query(models.CodeSnapshot).delete()
            db.query(models.CDIOProject).delete()
            db.query(models.CourseModule).delete()
            db.query(models.Enrollment).delete()
            db.query(models.Course).delete()
            db.query(models.Institution).delete()
            # Don't delete users to avoid login issues, or maybe just delete non-admin?
            # For now, let's keep users but maybe reset their enrollments/projects
        except Exception as e:
            print(f"Error wiping SQL data: {e}")
            db.rollback()
        else:
            db.commit()

    # --- In-Memory Seeding ---
    
    # Sample quiz for course 9 (AI for SMEs)
    # Note: course_id 9 might not be stable if we delete courses, so we should lookup safely later.
    # But for mock in-memory, we assume IDs align with our seeding order.
    
    quiz1 = Quiz(
        id=IDCounter.quiz,
        course_id=9,
        title="AI Fundamentals Knowledge Check",
        duration="15 min",
        questions=[
            QuizQuestion(id=1, text="What does AI stand for in the context of business automation?", options=["Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Application Interface"], correct_answer=1),
            QuizQuestion(id=2, text="Which of the following is a key benefit of AI agents for SMEs?", options=["24/7 availability", "Elimination of all jobs", "100% accuracy", "No internet needed"], correct_answer=0),
            QuizQuestion(id=3, text="What is the CDIO framework primarily used for?", options=["Database management", "Project-based learning", "Code debugging", "CRM"], correct_answer=1),
            QuizQuestion(id=4, text="In AI workflows, what is 'intent classification'?", options=["Classifying user intentions", "Sorting files", "Calendar events", "Spam filtering"], correct_answer=0),
            QuizQuestion(id=5, text="Recommended practice when deploying AI agents?", options=["Skip testing", "Test with real data", "Use sandbox first", "Never monitor"], correct_answer=2)
        ],
        created_at=datetime.now()
    )
    QUIZZES_DB[IDCounter.quiz] = quiz1
    IDCounter.quiz += 1

    # Sample Notifications
    notif1 = schemas.Notification(
        id=IDCounter.notification,
        user_id=1, 
        title="Welcome to TSEA-X",
        message="Welcome to the Transform Southeast Asia Xchange platform. Start your learning journey today!",
        type=schemas.NotificationType.SYSTEM,
        created_at=datetime.now()
    )
    NOTIFICATIONS_DB[IDCounter.notification] = notif1
    IDCounter.notification += 1
    
    notif2 = schemas.Notification(
        id=IDCounter.notification,
        user_id=1,
        title="New Course Available",
        message="Check out the new course 'AI Governance for Policymakers'.",
        type=schemas.NotificationType.INSTITUTION,
        created_at=datetime.now()
    )
    NOTIFICATIONS_DB[IDCounter.notification] = notif2
    IDCounter.notification += 1

    # Sample Conversation
    msg1 = schemas.Message(
        id=IDCounter.message,
        sender_id=2, 
        sender_name="Prof. Lin",
        content="Hello! How are you finding the Blue Carbon course?",
        created_at=datetime.now(),
        is_read=False
    )
    IDCounter.message += 1
    
    conv1 = schemas.Conversation(
        id=IDCounter.conversation,
        participants=[1, 2],
        participant_names=["You", "Prof. Lin"],
        last_message=msg1,
        updated_at=datetime.now(),
        messages=[msg1]
    )
    CONVERSATIONS_DB[IDCounter.conversation] = conv1
    IDCounter.conversation += 1

    # Sample Credentials
    cred1 = models.Credential(
        id=IDCounter.credential,
        user_id=1,
        credential_type="course_completion",
        title="Certified AI Strategist",
        description="Completed the AI Strategy for Business Leaders course.",
        issuer_name="TSEA-X Institute",
        issuer_id=1,
        status="issued",
        blockchain_network="Polygon Mumbai",
        token_id="T6C-000001",
        transaction_hash="0x123abc...",
        issued_at=datetime.now(),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    # Note: Credential is a SQL model generally, but here it's added to in-memory dict AND potentially SQL?
    # In main.py it was just adding to CREDENTIALS_DB (in-memory).
    # But Credential is defined in sql_models.py too.
    # We will stick to the pattern in main.py for now:
    CREDENTIALS_DB[IDCounter.credential] = cred1
    IDCounter.credential += 1

    # --- SQL Seeding ---
    try:
        # Create Users
        users_to_seed = [
            {"email": "mats@uid.or.id", "name": "Prof. Mats", "role": "instructor"},
            {"email": "putra@tsea.asia", "name": "Putra Admin", "role": "admin"},
            {"email": "student@tsea.asia", "name": "Student User", "role": "student"}
        ]

        mats_user = None

        for u in users_to_seed:
            existing = db.query(models.User).filter(models.User.email == u["email"]).first()
            if not existing:
                new_user = models.User(
                    email=u["email"],
                    full_name=u["name"],
                    role=u["role"],
                    password_hash="hashed_secret"
                )
                db.add(new_user)
                db.commit() # Commit each to ensure IDs are generated
                existing = new_user
                print(f"DEBUG: Created {u['role']} user {u['email']}")
            else:
                if existing.role != u["role"]:
                    existing.role = u["role"]
                    existing.full_name = u["name"]
                    db.commit()
            
            if u["email"] == "mats@uid.or.id":
                mats_user = existing
        
        # Seed Courses
        if mats_user:
            courses_to_seed = [
                # Sustainable Development
                {"title": "Circular Economy Models for SMEs", "category": "Sustainable Development", "level": "Beginner", "status": "published", "image": "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800"},
                {"title": "Blue Carbon Strategy", "category": "Sustainable Development", "level": "Advanced", "status": "published", "image": "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?w=800"},
                {"title": "Renewable Energy Transitions", "category": "Sustainable Development", "level": "Intermediate", "status": "published", "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800"},
                
                # Public Policy
                {"title": "AI Governance for Policymakers", "category": "Public Policy", "level": "Executive", "status": "approved", "image": "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800"},
                {"title": "Smart City Governance", "category": "Public Policy", "level": "Advanced", "status": "pending_approval", "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800"},
                
                # Data & AI
                {"title": "AI for SMEs: Practical Implementation", "category": "Data & AI", "level": "Beginner", "status": "published", "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800"},
                {"title": "Data Analytics for Decision Makers", "category": "Data & AI", "level": "Intermediate", "status": "published", "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"},
                
                # Business Leadership
                {"title": "Digital Transformation Strategy", "category": "Business Leadership", "level": "Executive", "status": "published", "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"}
            ]
            
            for c_data in courses_to_seed:
                existing_course = db.query(models.Course).filter(models.Course.title == c_data["title"]).first()
                if not existing_course:
                    new_course = models.Course(
                        title=c_data["title"],
                        instructor=mats_user.full_name,
                        instructor_id=mats_user.id,
                        org="UID",
                        image=c_data["image"],
                        tag="Featured",
                        level=c_data["level"],
                        category=c_data["category"],
                        description=f"Comprehensive course on {c_data['title']} designed for {c_data['level']} learners.",
                        duration="4 Weeks",
                        rating=4.8,
                        students_count="120",
                        institution_id=mats_user.institution_id,
                        approval_status=c_data.get("status", "approved")
                    )
                    db.add(new_course)
            
            db.commit()

            # Seed AI Fundamentals course with full 24-module content
            try:
                ai_fundamentals_course = seed_ai_fundamentals_content(db, force=force)
                print(f"DEBUG: Seeded AI Fundamentals course (ID: {ai_fundamentals_course.id if ai_fundamentals_course else 'existing'})")
            except Exception as e:
                print(f"WARN: Failed to seed AI Fundamentals content: {e}")

            # Seed Modules
            courses_with_content = db.query(models.Course).filter(models.Course.instructor_id == mats_user.id).all()
            for course in courses_with_content:
                # Check if modules exist
                count = db.query(models.CourseModule).filter(models.CourseModule.course_id == course.id).count()
                if count == 0 or force: # If forced, we cleared modules, so re-seed
                    # Create 4 standard modules
                    modules = [
                        {
                            "title": "Module 1: Foundations & Concepts",
                            "order": 0,
                            "content": f"Welcome to {course.title}. In this first module, we explore the fundamental principles and theoretical frameworks necessary for understanding the domain."
                        },
                        {
                            "title": "Module 2: Strategic Frameworks",
                            "order": 1,
                            "content": "This module dives deep into the strategic models used by industry leaders. We'll analyze case studies and identify key success factors."
                        },
                        {
                            "title": "Module 3: Implementation Roadmaps",
                            "order": 2,
                            "content": "Moving from theory to practice, we will look at how to design and execute implementation plans. Focus on the 'Realize' phase of the IRIS cycle."
                        },
                        {
                            "title": "Module 4: Future Trends & Mastery",
                            "order": 3,
                            "content": "We conclude by looking ahead at emerging technologies and future trends. You will apply your knowledge to a final capstone project."
                        }
                    ]
                    
                    for m in modules:
                        blocks = [
                            {"id": f"head-{m['order']}", "type": "heading", "content": m["title"], "metadata": {}},
                            {"id": f"text-{m['order']}", "type": "text", "content": m["content"], "metadata": {}},
                            {"id": f"discuss-{m['order']}", "type": "discussion", "content": "Reflect on how this applies to your current organization. What are the biggest barriers to implementation?", "metadata": {}}
                        ]
                        
                        new_mod = models.CourseModule(
                            course_id=course.id,
                            title=m["title"],
                            order=m["order"],
                            content_blocks=blocks,
                            status="published"
                        )
                        db.add(new_mod)
            
            db.commit()
            
            # --- Grading Queue Seeding (Projects) ---
            # Ensure we have active projects for the instructor to grade
            print("Syncing Grading Queue...")
            existing_projects_count = db.query(models.CDIOProject).count()
            
            if existing_projects_count == 0 or force:
                 # Create fresh sample projects linked to Mats' real courses
                 for idx, course in enumerate(courses_with_content[:5]): # Use first 5 courses
                    # Create a project for this course
                    project = models.CDIOProject(
                        course_id=course.id,
                        user_id=1, # Mock student (assuming ID 1 exists from previous step)
                        title=f"NUSA Sprint: {course.title} Solution",
                        current_phase="design",
                        overall_status="under_review",
                        completion_percentage=45
                    )
                    db.add(project)
                    db.commit() # Commit to get ID
                    
                    # Add data to make it appear in pending queue
                    if idx % 2 == 0:
                        charter = models.ProjectCharter(
                            project_id=project.id,
                            problem_statement="To solve urban congestion...",
                            success_metrics="Reduce traffic by 20%",
                            difficulty_level="High",
                            estimated_duration="3 months"
                        )
                        db.add(charter)
                    else:
                        blueprint = models.DesignBlueprint(
                            project_id=project.id,
                            logic_flow="User -> App -> Cloud -> Traffic Light",
                            component_list=["App", "Database", "IoT Sensor"]
                        )
                        db.add(blueprint)
                 
                 db.commit()
                 print("Grading Queue Synced with valid projects.")

    except Exception as e:
        print(f"Error during SQL seeding: {e}")
        db.rollback()
        raise e
    finally:
        # Note: Do not close db here if passed from dependency, but okay if managed internally.
        # However, caller owns the session.
        pass

