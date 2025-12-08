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
        name="Massachusetts Institute of Technology",
        short_name="MIT",
        type="university",
        description="World-renowned university.",
        logo_url="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png",
        country="United States",
        is_featured=True
    )
    uid = Institution(
        name="United in Diversity",
        short_name="UID",
        type="nonprofit",
        description="Sustainable development nonprofit.",
        logo_url="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80",
        country="International",
        is_featured=True
    )
    tech_corp = Institution(
        name="TechFuture Corp",
        short_name="TechFuture",
        type="corporate",
        description="Leading technology innovator.",
        logo_url="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
        country="Singapore",
        is_featured=False
    )
    min_edu = Institution(
        name="Ministry of Education",
        short_name="MOE",
        type="government",
        description="Government education body.",
        logo_url="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=200&q=80",
        country="Indonesia",
        is_featured=False
    )
    db.add_all([mit, uid, tech_corp, min_edu])
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
    
    # Partners
    partner_mit = User(email="partner.mit@tsea.asia", full_name="MIT Admin", role="partner")

    # Admins
    admin_user = User(email="admin@tsea.asia", full_name="System Admin", role="admin")
    
    db.add_all([inst_mats, inst_siti, inst_james, alice, bob, charlie, david, eve, partner_mit, admin_user])
    db.commit()

    # --- Courses ---
    course_circular = Course(
        title="Circular Economy Models",
        instructor="UID Expert Panel",
        org="United in Diversity",
        institution_id=uid.id,
        rating=4.8,
        students_count="12k",
        image="https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=600&q=80",
        level="Beginner",
        category="Sustainable Development",
        description="Learn the principles of circular economy and how to apply them.",
        duration="4 weeks"
    )
    course_ai = Course(
        title="AI Governance",
        instructor="GovTech Institute",
        org="MIT",
        institution_id=mit.id,
        rating=4.9,
        students_count="9k",
        image="https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&q=80",
        level="Executive",
        category="Public Policy",
        description="Understand the policy implications of AI.",
        duration="5 weeks"
    )
    course_digital = Course(
        title="Digital Transformation",
        instructor="James Wong",
        org="TechFuture",
        institution_id=tech_corp.id,
        rating=4.7,
        students_count="5k",
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
        level="Intermediate",
        category="Technology",
        description="Master the fundamentals of AI governance and ethics in modern organizations.",
        duration="6 weeks"
    )
    
    db.add_all([course_circular, course_ai, course_digital])
    db.commit()

    # --- Enrollments ---
    # Alice: Active in Circular Economy
    # Bob: Completed Circular Economy
    # Charlie: Active in AI Governance
    # David: Active in Digital Transformation
    # Eve: Active in AI Governance
    
    enrollments = [
        Enrollment(user_id=alice.id, course_id=course_circular.id, status="active"),
        Enrollment(user_id=bob.id, course_id=course_circular.id, status="completed"),
        Enrollment(user_id=charlie.id, course_id=course_ai.id, status="active"),
        Enrollment(user_id=david.id, course_id=course_digital.id, status="active"),
        Enrollment(user_id=eve.id, course_id=course_ai.id, status="active"),
    ]
    db.add_all(enrollments)
    db.commit()

    # --- Projects ---
    
    # 1. Alice (Design Phase) - Circular Economy
    proj_alice = CDIOProject(
        course_id=course_circular.id,
        user_id=alice.id,
        title="Waste-to-Energy for Local Markets",
        current_phase="design",
        overall_status="in_progress",
        completion_percentage=40
    )
    db.add(proj_alice)
    db.commit()
    
    db.add(ProjectCharter(
        project_id=proj_alice.id,
        problem_statement="Organic waste in markets causes pollution.",
        success_metrics="Convert 50% of waste to biogas.",
        target_outcome="Biogas digester prototype.",
        suggested_tools=["Python", "IoT Sensors"]
    ))
    db.add(DesignBlueprint(
        project_id=proj_alice.id,
        logic_flow="Waste -> Digester -> Gas -> Generator",
        component_list=["Digester Tank", "Gas Valve", "Arduino Controller"]
    ))
    
    # 2. Bob (Completed) - Circular Economy
    proj_bob = CDIOProject(
        course_id=course_circular.id,
        user_id=bob.id,
        title="Plastic Recycling Hub",
        current_phase="operate",
        overall_status="completed",
        completion_percentage=100
    )
    db.add(proj_bob)
    db.commit()
    
    db.add(ProjectCharter(
        project_id=proj_bob.id,
        problem_statement="Plastic pollution in rivers.",
        success_metrics="Recycle 1 ton per month.",
        target_outcome="Community recycling center."
    ))
    db.add(Deployment(
        project_id=proj_bob.id,
        deployment_url="https://plastic-hub.tsea.asia",
        verification_status="verified"
    ))
    
    # 3. Charlie (Conceive Phase) - AI Governance
    proj_charlie = CDIOProject(
        course_id=course_ai.id,
        user_id=charlie.id,
        title="Ethical AI Framework",
        current_phase="conceive",
        overall_status="in_progress",
        completion_percentage=10
    )
    db.add(proj_charlie)
    db.commit()
    
    db.add(ProjectCharter(
        project_id=proj_charlie.id,
        problem_statement="Lack of transparency in AI decisions.",
        success_metrics="Adopted by 3 local startups.",
        target_outcome="Open source governance framework."
    ))
    
    # 4. David (Implementation Phase) - Digital Transformation
    proj_david = CDIOProject(
        course_id=course_digital.id,
        user_id=david.id,
        title="SME Digital Wallet",
        current_phase="implement",
        overall_status="in_progress",
        completion_percentage=60
    )
    db.add(proj_david)
    db.commit()
    
    db.add(ProjectCharter(
        project_id=proj_david.id,
        problem_statement="SMEs lack digital payment options.",
        success_metrics="Onboard 100 merchants.",
        target_outcome="Mobile wallet app."
    ))
    db.add(Implementation(
        project_id=proj_david.id,
        code_repository_url="https://github.com/david/wallet",
        code_snapshot="def process_payment(): pass"
    ))
    
    # 5. Eve (Deployment Phase) - AI Governance
    proj_eve = CDIOProject(
        course_id=course_ai.id,
        user_id=eve.id,
        title="AI Bias Detector",
        current_phase="operate",
        overall_status="in_progress",
        completion_percentage=90
    )
    db.add(proj_eve)
    db.commit()
    
    db.add(ProjectCharter(
        project_id=proj_eve.id,
        problem_statement="Bias in hiring algorithms.",
        success_metrics="Reduce bias by 20%.",
        target_outcome="Bias detection tool."
    ))
    db.add(Deployment(
        project_id=proj_eve.id,
        deployment_url="https://bias-detector.tsea.asia",
        verification_status="submitted" # Waiting for verification
    ))
    
    db.commit()

    # --- Credentials ---
    cred_bob = Credential(
        user_id=bob.id,
        course_id=course_circular.id,
        title="Circular Economy Specialist",
        description="Completed the Circular Economy Models course.",
        issuer_name="United in Diversity",
        credential_type="course_completion",
        status="issued"
    )
    db.add(cred_bob)
    db.commit()

    # --- Instructor Demo Data (Mats Hanson) ---
    
    # Course 1: Advanced Renewable Energy Systems (Existing)
    course_mats_1 = Course(
        title="Advanced Renewable Energy Systems",
        instructor="Mats Hanson",
        org="UID",
        institution_id=uid.id,
        rating=4.5,
        students_count="25",
        image="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80",
        level="Advanced",
        category="Engineering"
    )
    db.add(course_mats_1)
    
    # Course 2: Sustainable Urban Planning (New)
    course_mats_2 = Course(
        title="Sustainable Urban Planning",
        instructor="Mats Hanson",
        org="UID",
        institution_id=uid.id,
        rating=4.7,
        students_count="42",
        image="https://images.unsplash.com/photo-1449824913929-2b3a3e357925?auto=format&fit=crop&w=600&q=80",
        level="Intermediate",
        category="Urban Planning"
    )
    db.add(course_mats_2)
    db.commit()

    # Scenario 1: Frank (Pending Deployment Review) - Course 1
    frank = User(email="frank@tsea.asia", full_name="Frank Wright", role="student")
    db.add(frank)
    db.commit()

    db.add(Enrollment(user_id=frank.id, course_id=course_mats_1.id, status="active"))
    
    proj_frank = CDIOProject(
        course_id=course_mats_1.id,
        user_id=frank.id,
        title="Solar Grid Optimization",
        current_phase="operate",
        overall_status="in_progress",
        completion_percentage=95
    )
    db.add(proj_frank)
    db.commit()

    db.add(ProjectCharter(
        project_id=proj_frank.id,
        problem_statement="Inefficient grid distribution.",
        success_metrics="Improve efficiency by 15%.",
        target_outcome="Optimized grid controller."
    ))
    db.add(Deployment(
        project_id=proj_frank.id,
        deployment_url="https://solar-grid.tsea.asia",
        verification_status="submitted" # Triggers Pending Review
    ))

    # Scenario 2: Grace (Pending Charter Review) - Course 2
    grace = User(email="grace@tsea.asia", full_name="Grace Ho", role="student")
    db.add(grace)
    db.commit()

    db.add(Enrollment(user_id=grace.id, course_id=course_mats_2.id, status="active"))

    proj_grace = CDIOProject(
        course_id=course_mats_2.id,
        user_id=grace.id,
        title="Green Roof Initiative",
        current_phase="conceive",
        overall_status="in_progress",
        completion_percentage=10
    )
    db.add(proj_grace)
    db.commit()

    db.add(ProjectCharter(
        project_id=proj_grace.id,
        problem_statement="Lack of green spaces in downtown.",
        success_metrics="Convert 5 rooftops.",
        target_outcome="Community garden network.",
        reasoning="AI Analysis: Feasible with current budget.",
        difficulty_level="Beginner",
        estimated_duration="3 months"
    ))
    # Note: No Deployment yet, but Charter exists. Dashboard logic checks for charter_id && !design_completed for "Charter Review"

    # Scenario 3: Harry (Active Design) - Course 1
    harry = User(email="harry@tsea.asia", full_name="Harry Potter", role="student")
    db.add(harry)
    db.commit()

    db.add(Enrollment(user_id=harry.id, course_id=course_mats_1.id, status="active"))

    proj_harry = CDIOProject(
        course_id=course_mats_1.id,
        user_id=harry.id,
        title="Wind Turbine Blade Design",
        current_phase="design",
        overall_status="in_progress",
        completion_percentage=40
    )
    db.add(proj_harry)
    db.commit()
    
    db.add(ProjectCharter(
        project_id=proj_harry.id,
        problem_statement="Noise pollution from turbines.",
        success_metrics="Reduce noise by 10dB.",
        target_outcome="Silent blade prototype."
    ))
    db.add(DesignBlueprint(
        project_id=proj_harry.id,
        logic_flow="Aerodynamic simulation -> Material selection -> 3D Print",
        component_list=["Carbon Fiber", "Resin"]
    ))

    db.commit()

    print("Seeding complete! Tables dropped and recreated with new data.")

if __name__ == "__main__":
    seed_data()
