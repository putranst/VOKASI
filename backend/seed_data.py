from database import SessionLocal, engine, Base
from sql_models import User, Institution, Course, CDIOProject, ProjectCharter, DesignBlueprint, Implementation, Deployment, Enrollment, Credential
from datetime import datetime, timedelta

def seed_data():
    # Re-create tables to ensure clean state
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    print("Seeding comprehensive demo data...")

    # --- Institutions ---
    mit = Institution(
        name="Massachusetts Institute of Technology", short_name="MIT", type="university",
        description="World-renowned university.", logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png",
        country="United States", is_featured=True
    )
    uid = Institution(
        name="United in Diversity", short_name="UID", type="nonprofit",
        description="Sustainable development nonprofit.", logo_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80",
        country="International", is_featured=True
    )
    tech_corp = Institution(
        name="TechFuture Corp", short_name="TechFuture", type="corporate",
        description="Leading technology innovator.", logo_url="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
        country="Singapore", is_featured=False
    )
    gov_tech = Institution(
        name="GovTech", short_name="GovTech", type="government",
        description="Government Technology Agency.", logo_url="https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=200&q=80",
        country="Singapore", is_featured=True
    )
    tsinghua = Institution(
        name="Tsinghua University", short_name="Tsinghua", type="university",
        description="Leading research university in Beijing.", logo_url="https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=200&q=80",
        country="China", is_featured=True
    )
    db.add_all([mit, uid, tech_corp, gov_tech, tsinghua])
    db.commit()

    # --- Users ---
    # Instructors
    inst_mats = User(email="mats@uid.or.id", full_name="Mats Hanson", role="instructor")
    inst_siti = User(email="dr.siti@tsea.asia", full_name="Dr. Siti", role="instructor")
    inst_james = User(email="james.w@tsea.asia", full_name="James Wong", role="instructor")
    
    # Students
    alice = User(email="alice@tsea.asia", full_name="Alice Tan", role="student") # Design Phase
    bob = User(email="bob@tsea.asia", full_name="Bob Nguyen", role="student") # Completed
    charlie = User(email="charlie@tsea.asia", full_name="Charlie Lee", role="student") # Conceive Phase
    david = User(email="david@tsea.asia", full_name="David Chen", role="student") # Implementation Phase
    eve = User(email="eve@tsea.asia", full_name="Eve Sato", role="student") # Deployment Phase
    frank = User(email="frank@tsea.asia", full_name="Frank Wright", role="student") # Scenario
    grace = User(email="grace@tsea.asia", full_name="Grace Ho", role="student") # Scenario
    harry = User(email="harry@tsea.asia", full_name="Harry Potter", role="student") # Scenario
    
    # Test User
    student_user = User(email="student@tsea.asia", full_name="Student User", role="student")
    
    # Admins
    admin_user = User(email="admin@tsea.asia", full_name="System Admin", role="admin")
    
    db.add_all([inst_mats, inst_siti, inst_james, alice, bob, charlie, david, eve, frank, grace, harry, student_user, admin_user])
    db.commit()

    # --- Courses (Full list of 21) ---
    # Assign courses to specific instructors: Mats Hanson (1,3,5,9,14), Dr. Siti (2,6,10,19), James Wong (4,7,8,11,12,15-21)
    courses = [
        # Sustainable Development - Mats Hanson teaches Course 1 and 3
        {"id": 1, "title": "Circular Economy Models for SMEs", "instructor": "Mats Hanson", "org": "United in Diversity", "rating": 4.8, "students_count": "12k", "image": "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=600&q=80", "tag": "Bestseller", "level": "Beginner", "category": "Sustainable Development", "institution_id": uid.id},
        {"id": 2, "title": "Blue Carbon: Marine Conservation Strategies", "instructor": "Dr. Siti", "org": "Tsinghua SEA", "rating": 4.9, "students_count": "8.5k", "image": "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&w=600&q=80", "tag": "New", "level": "Advanced", "category": "Sustainable Development", "institution_id": tsinghua.id},
        {"id": 3, "title": "Renewable Energy Transitions", "instructor": "Mats Hanson", "org": "MIT Sloan", "rating": 4.7, "students_count": "15k", "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80", "tag": "Trending", "level": "Intermediate", "category": "Sustainable Development", "institution_id": mit.id},
        {"id": 4, "title": "ESG Reporting Standards 2025", "instructor": "James Wong", "org": "GovTech", "rating": 4.9, "students_count": "22k", "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", "tag": "Essential", "level": "Executive", "category": "Sustainable Development", "institution_id": gov_tech.id},
        
        # Public Policy - Mats teaches Course 5, James teaches 7,8
        {"id": 5, "title": "AI Governance for Policymakers", "instructor": "Mats Hanson", "org": "T6 Public", "rating": 4.9, "students_count": "9k", "image": "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&q=80", "tag": "Updated", "level": "Executive", "category": "Public Policy", "institution_id": gov_tech.id},
        {"id": 6, "title": "Smart City Infrastructure Planning", "instructor": "Dr. Siti", "org": "Tsinghua Architecture", "rating": 4.6, "students_count": "7.2k", "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80", "tag": "Popular", "level": "Advanced", "category": "Public Policy", "institution_id": tsinghua.id},
        {"id": 7, "title": "Digital Identity & Sovereign Data", "instructor": "James Wong", "org": "T6 Tech", "rating": 4.8, "students_count": "5.5k", "image": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80", "tag": "Critical", "level": "Executive", "category": "Public Policy", "institution_id": gov_tech.id},
        {"id": 8, "title": "Crisis Management in the Digital Age", "instructor": "James Wong", "org": "GovTech", "rating": 4.7, "students_count": "11k", "image": "https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&w=600&q=80", "tag": "New", "level": "Intermediate", "category": "Public Policy", "institution_id": gov_tech.id},

        # Data & AI - Mats teaches Course 9, Dr. Siti teaches 10, James teaches 11,12
        {"id": 9, "title": "AI for SMEs: Practical Implementation", "instructor": "Mats Hanson", "org": "T6 Business", "rating": 4.8, "students_count": "18k", "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80", "tag": "Bestseller", "level": "Beginner", "category": "Data & AI", "institution_id": tech_corp.id},
        {"id": 10, "title": "Data Analytics for Decision Makers", "instructor": "Dr. Siti", "org": "MIT Sloan", "rating": 4.9, "students_count": "14k", "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", "tag": "Essential", "level": "Intermediate", "category": "Data & AI", "institution_id": mit.id},
        {"id": 11, "title": "Cyber Security Fundamentals", "instructor": "James Wong", "org": "T6 Security", "rating": 4.7, "students_count": "25k", "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80", "tag": "Critical", "level": "Beginner", "category": "Data & AI", "institution_id": tech_corp.id},
        {"id": 12, "title": "Advanced Machine Learning Ops", "instructor": "James Wong", "org": "Tsinghua SEA", "rating": 4.9, "students_count": "6k", "image": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80", "tag": "Advanced", "level": "Advanced", "category": "Data & AI", "institution_id": tsinghua.id},

        # Business Leadership - Mats teaches 14
        {"id": 14, "title": "Digital Transformation Strategy", "instructor": "Mats Hanson", "org": "MIT Sloan", "rating": 4.9, "students_count": "10k", "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", "tag": "Executive", "level": "Executive", "category": "Business Leadership", "institution_id": mit.id},
        {"id": 15, "title": "Agile Leadership for Government", "instructor": "James Wong", "org": "GovTech", "rating": 4.7, "students_count": "5k", "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80", "tag": "Niche", "level": "Advanced", "category": "Business Leadership", "institution_id": gov_tech.id},
        {"id": 16, "title": "Sustainable Supply Chain Management", "instructor": "James Wong", "org": "T6 Business", "rating": 4.8, "students_count": "9.5k", "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80", "tag": "Green", "level": "Intermediate", "category": "Business Leadership", "institution_id": tech_corp.id},
        {"id": 17, "title": "Financial Modeling for Startups", "instructor": "James Wong", "org": "Tsinghua SEA", "rating": 4.8, "students_count": "13k", "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80", "tag": "Practical", "level": "Beginner", "category": "Business Leadership", "institution_id": tsinghua.id},

        # Urban Planning - Dr. Siti teaches 19
        {"id": 18, "title": "Smart Mobility Systems", "instructor": "James Wong", "org": "GovTech", "rating": 4.7, "students_count": "6.5k", "image": "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80", "tag": "Future", "level": "Advanced", "category": "Urban Planning", "institution_id": gov_tech.id},
        {"id": 19, "title": "Green Building Certifications", "instructor": "Dr. Siti", "org": "T6 Green", "rating": 4.6, "students_count": "4k", "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80", "tag": "Technical", "level": "Intermediate", "category": "Urban Planning", "institution_id": uid.id},

        # Green Finance
        {"id": 20, "title": "Carbon Credits Trading 101", "instructor": "James Wong", "org": "T6 Finance", "rating": 4.9, "students_count": "16k", "image": "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&w=600&q=80", "tag": "Hot", "level": "Beginner", "category": "Green Finance", "institution_id": tech_corp.id},
        {"id": 21, "title": "Impact Investing Strategies", "instructor": "James Wong", "org": "United in Diversity", "rating": 4.8, "students_count": "7k", "image": "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=600&q=80", "tag": "Executive", "level": "Executive", "category": "Green Finance", "institution_id": uid.id}
    ]

    for c in courses:
        db.add(Course(
            id=c["id"],
            title=c["title"],
            instructor=c["instructor"],
            org=c["org"],
            rating=c["rating"],
            students_count=c["students_count"],
            image=c["image"],
            tag=c["tag"],
            level=c["level"],
            category=c["category"],
            institution_id=c["institution_id"],
            duration="4-8 weeks",
            description=f"Learn {c['title']} in this comprehensive course."
        ))
    db.commit()


    # --- Enrollments ---
    # Alice: Active in Circular Economy (Course 1)
    # Bob: Completed Circular Economy (Course 1)
    # Charlie: Active in AI Governance (Course 5)
    # David: Active in Digital Transformation (Course 14)
    # Eve: Active in AI Governance (Course 5)
    # Frank: Active in Renewable Energy (Course 3)
    # Grace: Active in Green Building (Course 19)
    # Harry: Active in Circular Economy (Course 1)
    # Student: Active in AI for SMEs (Course 9)
    
    enrollments = [
        Enrollment(user_id=alice.id, course_id=1, status="active"),
        Enrollment(user_id=bob.id, course_id=1, status="completed"),
        Enrollment(user_id=charlie.id, course_id=5, status="active"),
        Enrollment(user_id=david.id, course_id=14, status="active"),
        Enrollment(user_id=eve.id, course_id=5, status="active"),
        Enrollment(user_id=frank.id, course_id=3, status="active"),
        Enrollment(user_id=grace.id, course_id=19, status="active"),
        Enrollment(user_id=harry.id, course_id=1, status="active"),
        Enrollment(user_id=student_user.id, course_id=9, status="active"), # Our main test user
    ]
    db.add_all(enrollments)
    db.commit()

    # --- Projects ---
    
    # 1. Alice (Design Phase) - Course 1
    proj_alice = CDIOProject(
        course_id=1, user_id=alice.id, title="Waste-to-Energy for Local Markets",
        current_phase="design", overall_status="in_progress", completion_percentage=40
    )
    db.add(proj_alice)
    
    # 2. Bob (Completed) - Course 1
    proj_bob = CDIOProject(
        course_id=1, user_id=bob.id, title="Plastic Recycling Hub",
        current_phase="operate", overall_status="completed", completion_percentage=100
    )
    db.add(proj_bob)

    # 3. Charlie (Conceive Phase) - Course 5
    proj_charlie = CDIOProject(
        course_id=5, user_id=charlie.id, title="Ethical AI Framework",
        current_phase="conceive", overall_status="in_progress", completion_percentage=10
    )
    db.add(proj_charlie)

    # 4. David (Implementation Phase) - Course 14
    proj_david = CDIOProject(
        course_id=14, user_id=david.id, title="SME Digital Wallet",
        current_phase="implement", overall_status="in_progress", completion_percentage=60
    )
    db.add(proj_david)

    # 5. Eve (Deployment Phase) - Course 5
    proj_eve = CDIOProject(
        course_id=5, user_id=eve.id, title="AI Bias Detector",
        current_phase="operate", overall_status="in_progress", completion_percentage=90
    )
    db.add(proj_eve)
    
    db.commit()
    
    # Artifacts for projects (simplified for brevity but sufficient for logic)
    db.add(ProjectCharter(project_id=proj_alice.id, problem_statement="Waste issue", success_metrics="Less waste", target_outcome="Clean market"))
    
    db.add(ProjectCharter(project_id=proj_bob.id, problem_statement="Plastic issue", success_metrics="More recycling", target_outcome="Recycling center"))
    db.add(Deployment(project_id=proj_bob.id, deployment_url="https://bob-recycle.tsea.asia", verification_status="verified"))
    db.add(Credential(user_id=bob.id, course_id=1, title="Circular Economy Specialist", credential_type="course_completion", status="issued", issuer_name="UID"))

    db.add(ProjectCharter(project_id=proj_charlie.id, problem_statement="AI Bias", success_metrics="Fairness", target_outcome="Fair AI"))
    
    db.add(ProjectCharter(project_id=proj_david.id, problem_statement="No digital wallet", success_metrics="100 users", target_outcome="Wallet app"))
    db.add(Implementation(project_id=proj_david.id, code_snapshot="print('wallet')"))
    
    db.add(ProjectCharter(project_id=proj_eve.id, problem_statement="Bias in hiring", success_metrics="Less bias", target_outcome="Detector"))
    db.add(Deployment(project_id=proj_eve.id, deployment_url="https://eve-ai.tsea.asia", verification_status="submitted"))

    db.commit()
    print("Seeding complete! Full alignment with frontend established.")

if __name__ == "__main__":
    seed_data()
