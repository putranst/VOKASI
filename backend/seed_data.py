from database import SessionLocal, engine, Base
from sql_models import User, Institution, Course, CDIOProject, ProjectCharter, DesignBlueprint, Implementation, Deployment, Enrollment, Credential, LearningStreak
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
    # Institutional Instructors (linked to partner organizations)
    inst_mats = User(
        email="mats@uid.or.id", full_name="Mats Hanson", role="instructor",
        institution_id=uid.id, instructor_type="institutional"
    )
    inst_siti = User(
        email="dr.siti@tsea.asia", full_name="Dr. Siti", role="instructor",
        institution_id=tsinghua.id, instructor_type="institutional"
    )
    inst_james = User(
        email="james.w@tsea.asia", full_name="James Wong", role="instructor",
        institution_id=gov_tech.id, instructor_type="institutional"
    )
    
    # Individual Instructor (not linked to any institution)
    inst_individual = User(
        email="rangga@gmail.com", full_name="Rangga", role="instructor",
        instructor_type="individual"
    )
    
    # Institution Admins (partner dashboard users)
    uid_admin = User(email="admin@uid.or.id", full_name="UID Partner Admin", role="institution", institution_id=uid.id)
    tsinghua_admin = User(email="admin@tsinghua.edu", full_name="Tsinghua Partner Admin", role="institution", institution_id=tsinghua.id)
    govtech_admin = User(email="admin@govtech.sg", full_name="GovTech Partner Admin", role="institution", institution_id=gov_tech.id)
    
    # Students
    alice = User(email="alice@tsea.asia", full_name="Alice Tan", role="student") # Design Phase
    bob = User(email="bob@tsea.asia", full_name="Bob Nguyen", role="student") # Completed
    charlie = User(email="charlie@tsea.asia", full_name="Charlie Lee", role="student")  # New Learner - No pathway selected
    david = User(email="david@tsea.asia", full_name="David Chen", role="student", career_pathway_id="ai-ml-engineer")  # Experienced - AI/ML Engineer pathway
    eve = User(email="eve@tsea.asia", full_name="Eve Sato", role="student") # Deployment Phase
    frank = User(email="frank@tsea.asia", full_name="Frank Wright", role="student") # Scenario
    grace = User(email="grace@tsea.asia", full_name="Grace Ho", role="student") # Scenario
    harry = User(email="harry@tsea.asia", full_name="Harry Potter", role="student") # Scenario
    
    # Test User
    student_user = User(email="student@tsea.asia", full_name="Student User", role="student")
    
    # Platform Admins
    admin_user = User(email="admin@tsea.asia", full_name="System Admin", role="admin")
    
    db.add_all([
        inst_mats, inst_siti, inst_james, inst_individual,
        uid_admin, tsinghua_admin, govtech_admin,
        alice, bob, charlie, david, eve, frank, grace, harry,
        student_user, admin_user
    ])
    db.commit()

    # --- Courses (Full list of 21) ---
    # Instructor ID mapping for FK:
    # - inst_mats (UID): Courses 1, 3, 5, 9, 14
    # - inst_siti (Tsinghua): Courses 2, 6, 10, 19
    # - inst_james (GovTech): Courses 4, 7, 8, 11, 12, 15, 16, 17, 18, 20, 21
    
    instructor_map = {
        "Mats Hanson": inst_mats.id,
        "Dr. Siti": inst_siti.id,
        "James Wong": inst_james.id,
    }
    
    courses = [
        # Sustainable Development
        {"id": 1, "title": "Circular Economy Models for SMEs", "instructor": "Mats Hanson", "org": "United in Diversity", "rating": 4.8, "students_count": "12k", "image": "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=600&q=80", "tag": "Bestseller", "level": "Beginner", "category": "Sustainable Development", "institution_id": uid.id},
        {"id": 2, "title": "Blue Carbon: Marine Conservation Strategies", "instructor": "Dr. Siti", "org": "Tsinghua SEA", "rating": 4.9, "students_count": "8.5k", "image": "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&w=600&q=80", "tag": "New", "level": "Advanced", "category": "Sustainable Development", "institution_id": tsinghua.id},
        {"id": 3, "title": "Renewable Energy Transitions", "instructor": "Mats Hanson", "org": "MIT Sloan", "rating": 4.7, "students_count": "15k", "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80", "tag": "Trending", "level": "Intermediate", "category": "Sustainable Development", "institution_id": mit.id},
        {"id": 4, "title": "ESG Reporting Standards 2025", "instructor": "James Wong", "org": "GovTech", "rating": 4.9, "students_count": "22k", "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", "tag": "Essential", "level": "Executive", "category": "Sustainable Development", "institution_id": gov_tech.id},
        
        # Public Policy
        {"id": 5, "title": "AI Governance for Policymakers", "instructor": "Mats Hanson", "org": "T6 Public", "rating": 4.9, "students_count": "9k", "image": "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&q=80", "tag": "Updated", "level": "Executive", "category": "Public Policy", "institution_id": gov_tech.id},
        {"id": 6, "title": "Smart City Infrastructure Planning", "instructor": "Dr. Siti", "org": "Tsinghua Architecture", "rating": 4.6, "students_count": "7.2k", "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80", "tag": "Popular", "level": "Advanced", "category": "Public Policy", "institution_id": tsinghua.id},
        {"id": 7, "title": "Digital Identity & Sovereign Data", "instructor": "James Wong", "org": "T6 Tech", "rating": 4.8, "students_count": "5.5k", "image": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80", "tag": "Critical", "level": "Executive", "category": "Public Policy", "institution_id": gov_tech.id},
        {"id": 8, "title": "Crisis Management in the Digital Age", "instructor": "James Wong", "org": "GovTech", "rating": 4.7, "students_count": "11k", "image": "https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&w=600&q=80", "tag": "New", "level": "Intermediate", "category": "Public Policy", "institution_id": gov_tech.id},

        # Data & AI
        {"id": 9, "title": "AI for SMEs: Practical Implementation", "instructor": "Mats Hanson", "org": "T6 Business", "rating": 4.8, "students_count": "18k", "image": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80", "tag": "Bestseller", "level": "Beginner", "category": "Data & AI", "institution_id": tech_corp.id},
        {"id": 10, "title": "Data Analytics for Decision Makers", "instructor": "Dr. Siti", "org": "MIT Sloan", "rating": 4.9, "students_count": "14k", "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80", "tag": "Essential", "level": "Intermediate", "category": "Data & AI", "institution_id": mit.id},
        {"id": 11, "title": "Cyber Security Fundamentals", "instructor": "James Wong", "org": "T6 Security", "rating": 4.7, "students_count": "25k", "image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80", "tag": "Critical", "level": "Beginner", "category": "Data & AI", "institution_id": tech_corp.id},
        {"id": 12, "title": "Advanced Machine Learning Ops", "instructor": "James Wong", "org": "Tsinghua SEA", "rating": 4.9, "students_count": "6k", "image": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80", "tag": "Advanced", "level": "Advanced", "category": "Data & AI", "institution_id": tsinghua.id},

        # Business Leadership
        {"id": 14, "title": "Digital Transformation Strategy", "instructor": "Mats Hanson", "org": "MIT Sloan", "rating": 4.9, "students_count": "10k", "image": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80", "tag": "Executive", "level": "Executive", "category": "Business Leadership", "institution_id": mit.id},
        {"id": 15, "title": "Agile Leadership for Government", "instructor": "James Wong", "org": "GovTech", "rating": 4.7, "students_count": "5k", "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80", "tag": "Niche", "level": "Advanced", "category": "Business Leadership", "institution_id": gov_tech.id},
        {"id": 16, "title": "Sustainable Supply Chain Management", "instructor": "James Wong", "org": "T6 Business", "rating": 4.8, "students_count": "9.5k", "image": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80", "tag": "Green", "level": "Intermediate", "category": "Business Leadership", "institution_id": tech_corp.id},
        {"id": 17, "title": "Financial Modeling for Startups", "instructor": "James Wong", "org": "Tsinghua SEA", "rating": 4.8, "students_count": "13k", "image": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80", "tag": "Practical", "level": "Beginner", "category": "Business Leadership", "institution_id": tsinghua.id},

        # Urban Planning
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
            instructor_id=instructor_map.get(c["instructor"]),  # SET FK!
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
    # Mapping: Instructor -> Courses
    # - Mats Hanson: 1, 3, 5, 9, 14
    # - Dr. Siti: 2, 6, 10, 19
    # - James Wong: 4, 7, 8, 11, 12, 15, 16, 17, 18, 20, 21
    
    enrollments = [
        # Mats Hanson's courses
        Enrollment(user_id=alice.id, course_id=1, status="active"),      # Alice in Circular Economy
        Enrollment(user_id=bob.id, course_id=1, status="completed"),     # Bob completed Circular Economy
        Enrollment(user_id=harry.id, course_id=1, status="active"),      # Harry in Circular Economy
        Enrollment(user_id=charlie.id, course_id=5, status="active"),    # Charlie in AI Governance
        Enrollment(user_id=eve.id, course_id=5, status="active"),        # Eve in AI Governance
        Enrollment(user_id=frank.id, course_id=3, status="active"),      # Frank in Renewable Energy
        Enrollment(user_id=david.id, course_id=14, status="active"),     # David in Digital Transformation
        Enrollment(user_id=student_user.id, course_id=9, status="active"),  # Test user in AI for SMEs
        
        # Dr. Siti's courses (2, 6, 10, 19)
        Enrollment(user_id=alice.id, course_id=2, status="active"),      # Alice in Blue Carbon
        Enrollment(user_id=bob.id, course_id=6, status="active"),        # Bob in Smart City
        Enrollment(user_id=charlie.id, course_id=10, status="active"),   # Charlie in Data Analytics
        Enrollment(user_id=grace.id, course_id=19, status="active"),     # Grace in Green Building
        Enrollment(user_id=harry.id, course_id=10, status="active"),     # Harry in Data Analytics
        Enrollment(user_id=eve.id, course_id=2, status="active"),        # Eve in Blue Carbon
        
        # James Wong's courses (sample enrollments)
        Enrollment(user_id=david.id, course_id=11, status="active"),     # David in Cyber Security
        Enrollment(user_id=frank.id, course_id=20, status="active"),     # Frank in Carbon Credits
    ]
    db.add_all(enrollments)
    db.commit()

    # --- Projects (Now using IRIS Cycle phases) ---
    
    # NUSA Sprint Scenarios - mapping IRIS phases:
    # immersion = conceive (backward compat)
    # reflection = design
    # iteration = implement  
    # scale = operate
    
    # ===== Mats Hanson's Courses =====
    
    # 1. Alice (Reflection Phase) - Course 1 (Circular Economy)
    proj_alice = CDIOProject(
        course_id=1, user_id=alice.id, title="NUSA Sprint: Circular Economy Solution",
        current_phase="reflection", overall_status="in_progress", completion_percentage=40
    )
    db.add(proj_alice)
    
    # 2. Bob (Completed - Scale Phase) - Course 1 (Circular Economy)
    proj_bob = CDIOProject(
        course_id=1, user_id=bob.id, title="NUSA Sprint: Community Recycling Network",
        current_phase="scale", overall_status="completed", completion_percentage=100
    )
    db.add(proj_bob)

    # 3. Charlie (Immersion Phase) - Course 5 (AI Governance) - for Mats
    proj_charlie_mats = CDIOProject(
        course_id=5, user_id=charlie.id, title="NUSA Sprint: AI Ethics for Indonesia",
        current_phase="immersion", overall_status="in_progress", completion_percentage=10
    )
    db.add(proj_charlie_mats)

    # 4. David (Iteration Phase) - Course 14 (Digital Transformation) - for Mats
    proj_david_mats = CDIOProject(
        course_id=14, user_id=david.id, title="NUSA Sprint: Financial Inclusion App",
        current_phase="iteration", overall_status="in_progress", completion_percentage=60
    )
    db.add(proj_david_mats)

    # 5. Eve (Scale Phase) - Course 5 (AI Governance) - for Mats
    proj_eve_mats = CDIOProject(
        course_id=5, user_id=eve.id, title="NUSA Sprint: Fair Hiring AI",
        current_phase="scale", overall_status="in_progress", completion_percentage=90
    )
    db.add(proj_eve_mats)
    
    # 6. Frank (Reflection Phase) - Course 3 (Renewable Energy) - for Mats
    proj_frank = CDIOProject(
        course_id=3, user_id=frank.id, title="NUSA Sprint: Rural Energy Access",
        current_phase="reflection", overall_status="in_progress", completion_percentage=35
    )
    db.add(proj_frank)
    
    # 7. Harry - Course 1 (Circular Economy) - for Mats
    proj_harry = CDIOProject(
        course_id=1, user_id=harry.id, title="NUSA Sprint: Campus Sustainability",
        current_phase="immersion", overall_status="in_progress", completion_percentage=15
    )
    db.add(proj_harry)
    
    # ===== Dr. Siti's Courses (2, 6, 10, 19) =====
    
    # Alice - Course 2 (Blue Carbon)
    proj_alice_siti = CDIOProject(
        course_id=2, user_id=alice.id, title="NUSA Sprint: Mangrove Restoration",
        current_phase="reflection", overall_status="in_progress", completion_percentage=45
    )
    db.add(proj_alice_siti)
    
    # Bob - Course 6 (Smart City)
    proj_bob_siti = CDIOProject(
        course_id=6, user_id=bob.id, title="NUSA Sprint: Smart Traffic System",
        current_phase="iteration", overall_status="in_progress", completion_percentage=70
    )
    db.add(proj_bob_siti)
    
    # Charlie - Course 10 (Data Analytics)
    proj_charlie_siti = CDIOProject(
        course_id=10, user_id=charlie.id, title="NUSA Sprint: SME Analytics Dashboard",
        current_phase="immersion", overall_status="submitted", completion_percentage=25
    )
    db.add(proj_charlie_siti)
    
    # Grace - Course 19 (Green Building) - for Dr. Siti
    proj_grace = CDIOProject(
        course_id=19, user_id=grace.id, title="NUSA Sprint: Sustainable Construction",
        current_phase="iteration", overall_status="in_progress", completion_percentage=55
    )
    db.add(proj_grace)
    
    # Harry - Course 10 (Data Analytics)
    proj_harry_siti = CDIOProject(
        course_id=10, user_id=harry.id, title="NUSA Sprint: IoT Data Pipeline",
        current_phase="reflection", overall_status="submitted", completion_percentage=30
    )
    db.add(proj_harry_siti)
    
    # Eve - Course 2 (Blue Carbon)
    proj_eve_siti = CDIOProject(
        course_id=2, user_id=eve.id, title="NUSA Sprint: Coral Monitoring App",
        current_phase="scale", overall_status="in_progress", completion_percentage=85
    )
    db.add(proj_eve_siti)
    
    db.commit()
    
    # Artifacts for projects (simplified for brevity but sufficient for logic)
    
    # Mats's students
    db.add(ProjectCharter(project_id=proj_alice.id, problem_statement="Waste issue", success_metrics="Less waste", target_outcome="Clean market"))
    
    db.add(ProjectCharter(project_id=proj_bob.id, problem_statement="Plastic issue", success_metrics="More recycling", target_outcome="Recycling center"))
    db.add(Deployment(project_id=proj_bob.id, deployment_url="https://bob-recycle.tsea.asia", verification_status="verified"))
    db.add(Credential(user_id=bob.id, course_id=1, title="Circular Economy Specialist", credential_type="course_completion", status="issued", issuer_name="UID"))

    db.add(ProjectCharter(project_id=proj_charlie_mats.id, problem_statement="AI Bias", success_metrics="Fairness", target_outcome="Fair AI"))
    
    db.add(ProjectCharter(project_id=proj_david_mats.id, problem_statement="No digital wallet", success_metrics="100 users", target_outcome="Wallet app"))
    db.add(Implementation(project_id=proj_david_mats.id, code_snapshot="print('wallet')"))
    
    db.add(ProjectCharter(project_id=proj_eve_mats.id, problem_statement="Bias in hiring", success_metrics="Less bias", target_outcome="Detector"))
    db.add(Deployment(project_id=proj_eve_mats.id, deployment_url="https://eve-ai.tsea.asia", verification_status="submitted"))
    
    # Dr. Siti's students (with charters for grading queue)
    db.add(ProjectCharter(project_id=proj_alice_siti.id, problem_statement="Mangrove loss", success_metrics="Restored area", target_outcome="Healthy ecosystem"))
    db.add(ProjectCharter(project_id=proj_bob_siti.id, problem_statement="Traffic congestion", success_metrics="Reduced time", target_outcome="Smart lights"))
    db.add(Implementation(project_id=proj_bob_siti.id, code_snapshot="# Traffic optimization algorithm"))
    db.add(ProjectCharter(project_id=proj_charlie_siti.id, problem_statement="Data silos", success_metrics="Unified view", target_outcome="Analytics dashboard"))
    db.add(ProjectCharter(project_id=proj_grace.id, problem_statement="High carbon buildings", success_metrics="LEED certified", target_outcome="Green HQ"))
    db.add(Implementation(project_id=proj_grace.id, code_snapshot="# Sustainability audit tool"))
    db.add(ProjectCharter(project_id=proj_harry_siti.id, problem_statement="Disconnected sensors", success_metrics="Real-time data", target_outcome="IoT hub"))
    db.add(ProjectCharter(project_id=proj_eve_siti.id, problem_statement="Coral bleaching", success_metrics="Monitoring coverage", target_outcome="Alert system"))
    db.add(Deployment(project_id=proj_eve_siti.id, deployment_url="https://coral-watch.tsea.asia", verification_status="submitted"))

    db.commit()

    # --- Learning Streaks (Gamification) ---
    # Different scenarios for gamification data
    today = datetime.utcnow()
    
    # Alice: Active learner, 5-day streak
    streak_alice = LearningStreak(
        user_id=alice.id,
        current_streak=5,
        longest_streak=12,
        total_xp=2450,
        last_activity_date=today,
        week_activity=[True, True, True, True, True, False, False],  # M-F active
        badges=["first_course", "week_warrior", "fast_learner"],
        level=3
    )
    
    # Bob: Champion - completed course, lost streak but has high XP
    streak_bob = LearningStreak(
        user_id=bob.id,
        current_streak=0,
        longest_streak=28,
        total_xp=8500,
        last_activity_date=today - timedelta(days=5),
        week_activity=[False, False, False, False, False, False, False],
        badges=["first_course", "course_completed", "streak_master", "xp_champion", "certificate_earned"],
        level=8
    )
    
    # Charlie: New learner, just starting
    streak_charlie = LearningStreak(
        user_id=charlie.id,
        current_streak=1,
        longest_streak=1,
        total_xp=150,
        last_activity_date=today,
        week_activity=[False, False, False, False, False, False, True],
        badges=["first_login"],
        level=1
    )
    
    # David: Power user, 14-day streak (2 weeks!)
    streak_david = LearningStreak(
        user_id=david.id,
        current_streak=14,
        longest_streak=14,
        total_xp=4200,
        last_activity_date=today,
        week_activity=[True, True, True, True, True, True, True],  # Full week
        badges=["first_course", "week_warrior", "two_week_streak", "consistency_king"],
        level=5
    )
    
    # Eve: Consistent learner, 7-day weekly complete
    streak_eve = LearningStreak(
        user_id=eve.id,
        current_streak=7,
        longest_streak=21,
        total_xp=3800,
        last_activity_date=today,
        week_activity=[True, True, True, True, True, True, True],
        badges=["first_course", "week_warrior", "perfect_week", "three_week_streak"],
        level=4
    )
    
    # Frank: Moderate learner
    streak_frank = LearningStreak(
        user_id=frank.id,
        current_streak=3,
        longest_streak=10,
        total_xp=1850,
        last_activity_date=today,
        week_activity=[False, False, True, True, True, False, False],
        badges=["first_course", "fast_learner"],
        level=2
    )
    
    # Grace: Weekend warrior
    streak_grace = LearningStreak(
        user_id=grace.id,
        current_streak=2,
        longest_streak=8,
        total_xp=2100,
        last_activity_date=today,
        week_activity=[False, False, False, False, False, True, True],
        badges=["first_course", "weekend_warrior"],
        level=3
    )
    
    # Harry: Casual learner, just getting back
    streak_harry = LearningStreak(
        user_id=harry.id,
        current_streak=1,
        longest_streak=5,
        total_xp=780,
        last_activity_date=today,
        week_activity=[False, False, False, False, False, False, True],
        badges=["first_login", "comeback_kid"],
        level=1
    )
    
    # Student User (Demo): Moderate engagement
    streak_student = LearningStreak(
        user_id=student_user.id,
        current_streak=3,
        longest_streak=7,
        total_xp=890,
        last_activity_date=today,
        week_activity=[False, True, True, True, False, False, False],
        badges=["first_course", "first_project"],
        level=2
    )
    
    db.add_all([streak_alice, streak_bob, streak_charlie, streak_david, streak_eve, 
                streak_frank, streak_grace, streak_harry, streak_student])
    db.commit()
    
    print("Seeding complete! Full alignment with frontend established. Gamification data added.")

if __name__ == "__main__":
    seed_data()
