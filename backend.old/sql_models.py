import os
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text, JSON, ARRAY
from sqlalchemy.orm import relationship, backref
from database import Base
from datetime import datetime

_DB_URL = os.getenv("DATABASE_URL", "sqlite")
_USE_VECTOR = "postgresql" in _DB_URL or "postgres" in _DB_URL
if _USE_VECTOR:
    from pgvector.sqlalchemy import Vector
    _EmbeddingCol = lambda: Column(Vector(1536), nullable=True)
else:
    _EmbeddingCol = lambda: Column(JSON, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    name = Column(String, nullable=True)          # alias used by seed script & beta funnel
    role = Column(String)  # student, instructor, admin, institution_admin
    password_hash = Column(String, nullable=True)
    supabase_id = Column(String, unique=True, nullable=True, index=True)
    career_pathway_id = Column(String, nullable=True)

    # Instructor-specific fields
    institution_id = Column(Integer, ForeignKey("institutions.id"), nullable=True)
    instructor_type = Column(String, nullable=True)  # 'institutional' or 'individual'

    # Beta funnel fields
    onboarding_completed = Column(Boolean, default=False)
    onboarding_prepay_completed = Column(Boolean, default=False)
    onboarding_postpay_completed = Column(Boolean, default=False)
    registration_status = Column(String, default="registered")  # lead, registered, verified
    onboarding_phase = Column(String, default="none")  # none, prepay_complete, postpay_in_progress, postpay_complete
    funnel_status = Column(String, default="registered")  # lead, registered, payment_pending, paid, active, at_risk, completed
    bio = Column(Text, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    learning_goals = Column(JSON, nullable=True)   # list of goal strings

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    institution = relationship("Institution", backref="instructors")
    projects = relationship("CDIOProject", back_populates="user")
    enrollments = relationship("Enrollment", back_populates="user")
    credentials = relationship("Credential", back_populates="user")
    knowledge_nodes = relationship("KnowledgeNode", back_populates="user")
    learning_journal_entries = relationship("LearningJournal", back_populates="user")
    learning_streak = relationship("LearningStreak", uselist=False, back_populates="user")

class Institution(Base):
    __tablename__ = "institutions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    short_name = Column(String)
    type = Column(String)
    description = Column(Text)
    logo_url = Column(String)
    banner_url = Column(String, nullable=True)
    country = Column(String)
    website_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    # BR-003: White-label theming
    primary_color = Column(String, nullable=True)   # hex e.g. #064e3b
    accent_color = Column(String, nullable=True)    # hex e.g. #10b981
    favicon_url = Column(String, nullable=True)
    custom_logo_url = Column(String, nullable=True)
    platform_name = Column(String, nullable=True)   # override "VOKASI"
    
    courses = relationship("Course", back_populates="institution")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    instructor = Column(String)  # Instructor name (for display)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Link to instructor user
    org = Column(String)
    institution_id = Column(Integer, ForeignKey("institutions.id"))
    rating = Column(Float, default=0.0)
    students_count = Column(String) # Keeping as string to match "12k" format for now, or change to int
    image = Column(String)
    tag = Column(String, nullable=True)
    level = Column(String)
    category = Column(String)
    description = Column(Text, nullable=True)
    duration = Column(String, nullable=True)
    
    # Approval workflow fields
    approval_status = Column(String, default="approved")  # draft, pending_approval, approved, rejected
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    institution = relationship("Institution", back_populates="courses")
    projects = relationship("CDIOProject", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")
    syllabi = relationship("Syllabus", back_populates="course")
    modules = relationship("CourseModule", back_populates="course", order_by="CourseModule.order")

class CourseModule(Base):
    """Content modules for the WYSIWYG editor"""
    __tablename__ = "course_modules"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    title = Column(String)
    order = Column(Integer, default=0)
    content_blocks = Column(JSON, default=list) # List of ContentBlock objects
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("Course", back_populates="modules")

class Syllabus(Base):
    """T6 Syllabus Standard - MIT OCW + TSEA-X CDIO Hybrid"""
    __tablename__ = "syllabi"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    version = Column(String, default="1.0")
    title = Column(String)
    overview = Column(Text, nullable=True)
    learning_outcomes = Column(JSON, nullable=True)  # List of outcomes
    assessment_strategy = Column(JSON, nullable=True)  # {quizzes: %, projects: %, capstone: %}
    resources = Column(JSON, nullable=True)  # List of textbooks, links
    hexahelix_sectors = Column(JSON, nullable=True)  # Sectors this course aligns with
    duration_weeks = Column(Integer, default=4)
    status = Column(String, default="draft")  # draft, published, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("Course", back_populates="syllabi")
    sections = relationship("SyllabusSection", back_populates="syllabus", order_by="SyllabusSection.order")

class SyllabusSection(Base):
    """Individual section within a syllabus, aligned to CDIO phase"""
    __tablename__ = "syllabus_sections"
    id = Column(Integer, primary_key=True, index=True)
    syllabus_id = Column(Integer, ForeignKey("syllabi.id"))
    order = Column(Integer, default=0)
    title = Column(String)
    cdio_phase = Column(String)  # conceive, design, implement, operate
    week_number = Column(Integer, nullable=True)
    topics = Column(JSON, nullable=True)  # List of topic strings
    activities = Column(JSON, nullable=True)  # List of activities
    assessment = Column(String, nullable=True)  # Quiz, Assignment, etc.
    duration_hours = Column(Float, default=2.0)
    
    syllabus = relationship("Syllabus", back_populates="sections")

class CDIOProject(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    current_phase = Column(String, default="conceive")
    overall_status = Column(String, default="not_started")
    completion_percentage = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, default=datetime.utcnow)
    last_activity_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="projects")
    user = relationship("User", back_populates="projects")
    snapshots = relationship("CodeSnapshot", back_populates="project")
    
    # One-to-one relationships for phases
    charter = relationship("ProjectCharter", uselist=False, back_populates="project")
    blueprint = relationship("DesignBlueprint", uselist=False, back_populates="project")
    implementation = relationship("Implementation", uselist=False, back_populates="project")
    deployment = relationship("Deployment", uselist=False, back_populates="project")

    @property
    def conceive_completed(self):
        return self.charter is not None

    @property
    def design_completed(self):
        return self.blueprint is not None

    @property
    def implement_completed(self):
        return self.implementation is not None

    @property
    def operate_completed(self):
        return self.deployment is not None

    @property
    def charter_id(self):
        return self.charter.id if self.charter else None

    @property
    def blueprint_id(self):
        return self.blueprint.id if self.blueprint else None

    @property
    def implementation_id(self):
        return self.implementation.id if self.implementation else None

    @property
    def deployment_id(self):
        return self.deployment.id if self.deployment else None

class ProjectCharter(Base):
    __tablename__ = "project_charters"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    problem_statement = Column(Text)
    success_metrics = Column(Text)
    target_outcome = Column(Text, nullable=True)
    constraints = Column(Text, nullable=True)
    stakeholders = Column(Text, nullable=True)
    suggested_tools = Column(JSON, nullable=True)
    reasoning = Column(Text, nullable=True)
    difficulty_level = Column(String, nullable=True)
    estimated_duration = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("CDIOProject", back_populates="charter")

class DesignBlueprint(Base):
    __tablename__ = "design_blueprints"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    architecture_diagram = Column(JSON, nullable=True)
    logic_flow = Column(Text, nullable=True)
    component_list = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("CDIOProject", back_populates="blueprint")

class Implementation(Base):
    __tablename__ = "implementations"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    iteration_number = Column(Integer, default=1)
    hypothesis = Column(Text, nullable=True)
    learnings = Column(Text, nullable=True)
    code_repository_url = Column(String, nullable=True)
    code_snapshot = Column(Text, nullable=True)
    next_hypothesis = Column(String, nullable=True)
    ai_feedback = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    security_check_passed = Column(Boolean, default=False)
    linting_passed = Column(Boolean, default=False)
    tests_passed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("CDIOProject", back_populates="implementation")

class Deployment(Base):
    __tablename__ = "deployments"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    deployment_url = Column(String, nullable=True)
    deployment_platform = Column(String, nullable=True)
    readme = Column(Text, nullable=True)
    verification_status = Column(String, default="submitted")
    sbt_minted = Column(Boolean, default=False)
    sbt_token_id = Column(String, nullable=True)
    transaction_hash = Column(String, nullable=True)
    explorer_url = Column(String, nullable=True)
    
    # Scale Phase Fields
    institutional_handoff = Column(Text, nullable=True)
    stakeholder_training = Column(Text, nullable=True)
    impact_metrics = Column(JSON, nullable=True)
    sfia_evidence = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("CDIOProject", back_populates="deployment")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    status = Column(String, default="active")  # active, dropped, completed
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    # Beta funnel fields
    cohort_id = Column(Integer, ForeignKey("beta_cohorts.id"), nullable=True)
    payment_status = Column(String, nullable=True)  # pending, paid, scholarship
    payment_reference = Column(String, nullable=True)  # Midtrans order_id
    amount_usd = Column(Float, nullable=True)          # locked-in tier price
    payment_attempt_status = Column(String, default="initiated")  # initiated, pending, paid, failed, expired
    payment_expires_at = Column(DateTime, nullable=True)
    payment_confirmed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class Credential(Base):
    __tablename__ = "credentials"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    title = Column(String)
    description = Column(Text)
    issuer_name = Column(String)
    issuer_id = Column(Integer, nullable=True)
    credential_type = Column(String)
    status = Column(String, default="issued")
    wallet_address = Column(String, nullable=True)
    transaction_hash = Column(String, nullable=True)
    token_id = Column(String, nullable=True)
    metadata_uri = Column(String, nullable=True)
    blockchain_network = Column(String, nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="credentials")

class RevenueTransaction(Base):
    __tablename__ = "revenue_transactions"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=False)
    transaction_type = Column(String) # enrollment, certificate, subscription
    transaction_date = Column(DateTime, default=datetime.utcnow)
    
    course = relationship("Course")
    user = relationship("User")

# ===== PKC Models =====

class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    node_type = Column(String, default="concept") # concept, note, resource, project_artifact
    source_id = Column(String, nullable=True)
    embedding = _EmbeddingCol()
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="knowledge_nodes")
    # Relationships for links could be added here if needed, but might be complex due to self-referential nature

class KnowledgeLink(Base):
    __tablename__ = "knowledge_links"
    id = Column(Integer, primary_key=True, index=True)
    source_node_id = Column(Integer, ForeignKey("knowledge_nodes.id"))
    target_node_id = Column(Integer, ForeignKey("knowledge_nodes.id"))
    link_type = Column(String, default="related") # related, prerequisite, part_of
    weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class LearningJournal(Base):
    __tablename__ = "learning_journal"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    entry_type = Column(String, nullable=False) # reflection, goal, achievement
    content = Column(Text, nullable=False)
    sentiment_score = Column(Float, nullable=True)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="learning_journal_entries")

class CodeSnapshot(Base):
    __tablename__ = "code_snapshots"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    code = Column(Text)
    language = Column(String, default="python")
    timestamp = Column(DateTime, default=datetime.utcnow)
    auto_saved = Column(Boolean, default=True)
    file_name = Column(String, nullable=True)
    
    project = relationship("CDIOProject", back_populates="snapshots")


class LessonProgress(Base):
    """Tracks which modules a student has completed within a course"""
    __tablename__ = "lesson_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    module_id = Column(Integer, ForeignKey("course_modules.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class PuckBlockProgress(Base):
    """LE-002: Per-block completion for Puck-generated course content"""
    __tablename__ = "puck_block_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    block_id = Column(String, nullable=False)
    status = Column(String, default="completed")
    completed_at = Column(DateTime, nullable=True, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReflectionEntry(Base):
    """LE-007: Student reflection journal entry with AI feedback"""
    __tablename__ = "reflection_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    block_id = Column(String, nullable=False)
    text = Column(String, nullable=False)
    word_count = Column(Integer, default=0)
    ai_feedback = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class CourseCertificate(Base):
    """LE-006: Verifiable course completion certificate"""
    __tablename__ = "course_certificates"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    capstone_id = Column(Integer, ForeignKey("capstone_submissions.id"), nullable=True)
    cert_code = Column(String, unique=True, nullable=False, index=True)
    issued_at = Column(DateTime, default=datetime.utcnow)
    student_name = Column(String, nullable=True)
    course_title = Column(String, nullable=True)


class DiscussionPost(Base):
    """LE-008: Live forum post for DiscussionSeed blocks"""
    __tablename__ = "discussion_posts"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    block_id = Column(String, nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("discussion_posts.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String, nullable=True)
    body = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    upvoters = Column(JSON, default=list)  # list of user_ids who upvoted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    replies = relationship(
        "DiscussionPost",
        backref=backref("parent", remote_side=[id]),
        foreign_keys=[parent_id],
    )


# ── Beta Funnel Models ──────────────────────────────────────────────────────

class BetaCohort(Base):
    """Beta launch cohort with tiered pricing and seat cap."""
    __tablename__ = "beta_cohorts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)           # e.g. "Beta 2026"
    slug = Column(String, unique=True, nullable=False, index=True)  # e.g. "beta-2026"
    description = Column(Text, nullable=True)
    seat_cap = Column(Integer, default=1000)
    seats_sold = Column(Integer, default=0)         # incremented atomically on payment confirm
    is_active = Column(Boolean, default=True)
    # Tiered pricing: list of {"max_seat": N, "price_usd": X}
    pricing_tiers = Column(JSON, default=list)      # [{max_seat:100,price_usd:1}, ...]
    # Bundled course IDs (NULL = learner picks)
    fixed_course_ids = Column(JSON, nullable=True)  # [course_id, ...] or null
    midtrans_merchant_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship("Enrollment", backref="cohort")


class PaymentEvent(Base):
    """Audit/event stream for payment lifecycle and reconciliation."""
    __tablename__ = "payment_events"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, index=True, nullable=False)
    cohort_slug = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event_type = Column(String, nullable=False)  # initiated, webhook_paid, webhook_pending, expired, failed, reconciled
    provider = Column(String, default="midtrans")
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmailDeliveryLog(Base):
    """Email delivery audit for observability and retry outcomes."""
    __tablename__ = "email_delivery_logs"
    id = Column(Integer, primary_key=True, index=True)
    template_key = Column(String, nullable=False, index=True)
    to_email = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False)  # sent, failed
    attempts = Column(Integer, default=1)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CapstoneSubmission(Base):
    """Beta funnel: simplified capstone (no full IRIS cycle)."""
    __tablename__ = "capstone_submissions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cohort_id = Column(Integer, ForeignKey("beta_cohorts.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    artifact_url = Column(String, nullable=True)    # deployed URL
    github_url = Column(String, nullable=True)
    additional_notes = Column(Text, nullable=True)
    # AI pre-grade
    ai_score = Column(Integer, nullable=True)       # 0-100
    ai_feedback = Column(Text, nullable=True)
    ai_graded_at = Column(DateTime, nullable=True)
    # Instructor review
    status = Column(String, default="pending")      # pending, ai_graded, approved, rejected, revision_requested
    instructor_score = Column(Integer, nullable=True)
    instructor_feedback = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class AlumniProfile(Base):
    """Post-graduation public profile for beta alumni network."""
    __tablename__ = "alumni_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    cohort_id = Column(Integer, ForeignKey("beta_cohorts.id"), nullable=True)
    display_name = Column(String, nullable=False)
    headline = Column(String, nullable=True)        # e.g. "Web Developer at Tokopedia"
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    skills = Column(JSON, default=list)             # ["Python", "FastAPI", ...]
    capstone_title = Column(String, nullable=True)
    capstone_url = Column(String, nullable=True)
    cert_code = Column(String, nullable=True)       # links to CourseCertificate
    is_visible = Column(Boolean, default=True)      # learner can hide profile
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="alumni_profile")


class LearningStreak(Base):
    """Gamification: Tracks user learning streaks, XP, and badges"""
    __tablename__ = "learning_streaks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_xp = Column(Integer, default=0)
    last_activity_date = Column(DateTime, nullable=True)
    week_activity = Column(JSON, default=list)  # [Mon, Tue, Wed, Thu, Fri, Sat, Sun] booleans
    badges = Column(JSON, default=list)  # List of earned badge IDs
    level = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="learning_streak")
