from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text, JSON, ARRAY
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
from pgvector.sqlalchemy import Vector

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(String)  # student, instructor, admin
    password_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("CDIOProject", back_populates="user")
    enrollments = relationship("Enrollment", back_populates="user")
    credentials = relationship("Credential", back_populates="user")
    knowledge_nodes = relationship("KnowledgeNode", back_populates="user")
    learning_journal_entries = relationship("LearningJournal", back_populates="user")

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
    
    courses = relationship("Course", back_populates="institution")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    instructor = Column(String)
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
    
    institution = relationship("Institution", back_populates="courses")
    projects = relationship("CDIOProject", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")
    syllabi = relationship("Syllabus", back_populates="course")

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
    code_repository_url = Column(String, nullable=True)
    code_snapshot = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    security_check_passed = Column(Boolean, default=False)
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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("CDIOProject", back_populates="deployment")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"))
    status = Column(String, default="active")
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    
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
    embedding = Column(JSON, nullable=True)
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

