from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# ===== Existing Models =====

class Course(ORMBase):
    id: int
    title: str
    instructor: str
    org: str
    rating: float
    students_count: str
    image: str
    tag: Optional[str] = None
    level: str
    category: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None

class CourseCreate(BaseModel):
    """Model for creating a new course"""
    title: str = Field(..., min_length=3, max_length=200)
    instructor: str = Field(..., min_length=2, max_length=100)
    org: str = Field(..., min_length=2, max_length=100)
    image: str = Field(..., description="URL to course image")
    tag: Optional[str] = Field(None, max_length=50)
    level: str = Field(..., description="Course difficulty level")
    category: str = Field(..., description="Course category")
    description: Optional[str] = Field(None, max_length=1000)
    duration: Optional[str] = Field(None, description="Course duration (e.g., '4 weeks')")
    institution_id: Optional[int] = None

class CourseUpdate(BaseModel):
    """Model for updating a course"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    level: Optional[str] = None
    category: Optional[str] = None
    image: Optional[str] = None
    duration: Optional[str] = None
    tag: Optional[str] = None

class Pathway(BaseModel):
    title: str
    subtitle: str
    courses: int
    duration: str
    partner: str
    icon: str  # Storing icon name as string
    color: str
    bg: str

class Instructor(BaseModel):
    name: str
    title: str
    bio: str


# ===== Institution/Partner Models =====

class InstitutionType(str, Enum):
    UNIVERSITY = "university"
    CORPORATE = "corporate"
    NONPROFIT = "nonprofit"
    GOVERNMENT = "government"

class Institution(ORMBase):
    id: int
    name: str
    short_name: str  # e.g., "MIT", "Harvard"
    type: InstitutionType
    description: str
    logo_url: str
    banner_url: Optional[str] = None
    country: str
    founded_year: Optional[int] = None
    website_url: Optional[str] = None
    
    # Stats
    total_courses: int = 0
    total_learners: str = "0"  # e.g., "50K+"
    total_programs: int = 0
    
    # Social/Contact
    email: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    
    # Partnership info
    partner_since: Optional[str] = None  # e.g., "2020"
    is_featured: bool = False
    
    created_at: datetime
    updated_at: datetime

class InstitutionDetail(BaseModel):
    """Extended institution profile with courses and programs"""
    institution: Institution
    courses: List[Course] = []
    featured_instructors: List[Instructor] = []
    pathways: List[Pathway] = []
    
class InstitutionStats(BaseModel):
    """Dashboard statistics for institution admin"""
    institution_id: int
    total_active_students: int
    total_completions: int
    total_certificates_issued: int
    average_course_rating: float
    total_revenue: float
    month_over_month_growth: float


# ===== CDIO Framework Models =====

class CDIOPhase(str, Enum):
    CONCEIVE = "conceive"
    DESIGN = "design"
    IMPLEMENT = "implement"
    OPERATE = "operate"

class ProjectStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


# ===== Conceive Phase Models =====

class ProjectCharterCreate(BaseModel):
    """Request model for creating a project charter (Conceive phase)"""
    problem_statement: str = Field(..., min_length=50, max_length=2000, description="Business problem or challenge")
    success_metrics: str = Field(..., min_length=20, max_length=500, description="How success will be measured")
    target_outcome: Optional[str] = Field(None, max_length=500, description="Desired end result")
    constraints: Optional[str] = Field(None, max_length=500, description="Budget, time, or resource constraints")
    stakeholders: Optional[str] = Field(None, max_length=300, description="Who is affected or involved")

class ProjectCharter(BaseModel):
    """Complete project charter (Conceive phase output)"""
    id: int
    project_id: int
    problem_statement: str
    success_metrics: str
    target_outcome: Optional[str] = None
    constraints: Optional[str] = None
    stakeholders: Optional[str] = None
    # AI-generated fields (templates for now)
    suggested_tools: List[str] = []
    reasoning: Optional[str] = None
    estimated_duration: Optional[str] = None
    difficulty_level: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ===== Design Phase Models =====

class DesignBlueprintCreate(BaseModel):
    """Request model for creating/updating design blueprint"""
    architecture_diagram: Optional[Dict[str, Any]] = Field(None, description="JSON representation of Excalidraw/Miro diagram")
    logic_flow: Optional[str] = Field(None, max_length=2000, description="Written description of logic flow")
    component_list: Optional[List[str]] = Field(None, description="List of components/modules")
    data_flow: Optional[str] = Field(None, max_length=1000, description="How data flows through system")

class DesignBlueprint(BaseModel):
    """Design blueprint (Design phase output)"""
    id: int
    project_id: int
    architecture_diagram: Optional[Dict[str, Any]] = None
    logic_flow: Optional[str] = None
    component_list: List[str] = []
    data_flow: Optional[str] = None
    ai_validation_score: Optional[float] = None  # Socratic tutor feedback score
    validation_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ===== Implement Phase Models =====

class ImplementationCreate(BaseModel):
    """Request model for code/implementation submission"""
    code_repository_url: Optional[str] = None
    code_snapshot: Optional[str] = Field(None, description="Code content snapshot")
    framework_used: Optional[str] = None
    dependencies: Optional[List[str]] = None
    notes: Optional[str] = Field(None, max_length=1000)

class Implementation(BaseModel):
    """Implementation artifacts (Implement phase output)"""
    id: int
    project_id: int
    code_repository_url: Optional[str] = None
    code_snapshot: Optional[str] = None
    framework_used: Optional[str] = None
    dependencies: List[str] = []
    notes: Optional[str] = None
    linting_passed: bool = False
    security_check_passed: bool = False
    created_at: datetime
    updated_at: datetime


# ===== Operate Phase Models =====

class DeploymentCreate(BaseModel):
    """Request model for project deployment"""
    deployment_url: Optional[str] = None
    deployment_platform: Optional[str] = None
    environment_variables: Optional[Dict[str, str]] = None
    readme: Optional[str] = None

class Deployment(BaseModel):
    """Deployment record (Operate phase output)"""
    id: int
    project_id: int
    deployment_url: Optional[str] = None
    deployment_platform: Optional[str] = None
    environment_variables: Optional[Dict[str, str]] = None
    readme: Optional[str] = None
    verification_status: ProjectStatus = ProjectStatus.SUBMITTED
    verification_tests_passed: int = 0
    verification_tests_total: int = 0
    uptime_percentage: Optional[float] = None
    sbt_minted: bool = False
    sbt_token_id: Optional[str] = None
    transaction_hash: Optional[str] = None
    explorer_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ===== CDIO Project Core Model =====

class CDIOProjectCreate(BaseModel):
    """Request model for creating a new CDIO project"""
    course_id: int
    user_id: int
    project_title: Optional[str] = Field(None, max_length=200)

class CDIOProject(ORMBase):
    """Main CDIO project model tracking all phases"""
    id: int
    course_id: int
    user_id: int
    project_title: str = Field(validation_alias="title")
    current_phase: CDIOPhase = CDIOPhase.CONCEIVE
    overall_status: ProjectStatus = ProjectStatus.NOT_STARTED
    
    # Phase completion tracking
    conceive_completed: bool = False
    design_completed: bool = False
    implement_completed: bool = False
    operate_completed: bool = False
    
    # References to phase artifacts
    charter_id: Optional[int] = None
    blueprint_id: Optional[int] = None
    implementation_id: Optional[int] = None
    deployment_id: Optional[int] = None
    
    # Progress tracking
    completion_percentage: int = 0
    started_at: datetime
    completed_at: Optional[datetime] = None
    last_activity_at: datetime


class CDIOProjectDetail(BaseModel):
    """Detailed project view with all phase data"""
    project: CDIOProject
    charter: Optional[ProjectCharter] = None
    blueprint: Optional[DesignBlueprint] = None
    implementation: Optional[Implementation] = None
    deployment: Optional[Deployment] = None


# ===== Quiz Models =====

class QuizQuestion(BaseModel):
    """Individual quiz question"""
    id: int
    text: str
    options: List[str]
    correct_answer: int  # Index of correct option (0-based)

class Quiz(BaseModel):
    """Quiz structure"""
    id: int
    course_id: int
    title: str
    duration: str
    questions: List[QuizQuestion]
    created_at: datetime
    
class QuizSubmissionCreate(BaseModel):
    """Request model for quiz submission"""
    user_id: int
    answers: Dict[int, int]  # question_id -> selected_option_index

class QuizSubmission(BaseModel):
    """Quiz submission with results"""
    id: int
    quiz_id: int
    user_id: int
    answers: Dict[int, int]
    score: int
    total_questions: int
    passed: bool
    submitted_at: datetime


# ===== Discussion Models =====

class DiscussionComment(BaseModel):
    """Reply/comment in a discussion thread"""
    id: int
    thread_id: int
    user_id: int
    author_name: str
    content: str
    created_at: datetime
    likes: int = 0

class DiscussionCommentCreate(BaseModel):
    """Request model for creating a comment"""
    user_id: int
    author_name: str
    content: str = Field(..., min_length=1, max_length=1000)


# ===== Student Dashboard Models =====

class DashboardCourseProgress(BaseModel):
    course_id: int
    project_id: Optional[int] = None
    title: str
    image: str
    category: Optional[str] = None
    progress: int
    current_phase: str  # e.g., "Conceive", "Design"
    next_deadline: Optional[str] = None
    remaining_time: Optional[str] = None

class DashboardCredential(BaseModel):
    id: int
    title: str
    org: str
    date: str
    hash: Optional[str] = None
    verified: bool = True

class StudentDashboardData(BaseModel):
    enrolled_courses: List[DashboardCourseProgress]
    credentials: List[DashboardCredential]
    total_learning_hours: int
    average_progress: int
    upcoming_deadlines: List[Dict[str, Any]] = []
    recommended_courses: List[Course] = []


# ===== Enrollment Models =====

class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"

class Enrollment(ORMBase):
    """Student enrollment in a course"""
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE
    completed_at: Optional[datetime] = None

class EnrollmentCreate(BaseModel):
    """Request model for creating an enrollment"""
    user_id: int
    course_id: int

class DiscussionThread(BaseModel):
    """Discussion forum thread"""
    id: int
    course_id: int
    user_id: int
    author_name: str
    title: str
    content: str
    created_at: datetime
    comments_count: int = 0
    likes: int = 0
    comments: List[DiscussionComment] = []

class DiscussionThreadCreate(BaseModel):
    """Request model for creating a discussion thread"""
    user_id: int
    author_name: str
    title: str = Field(..., min_length=5, max_length=200)
    content: str = Field(..., min_length=10, max_length=2000)


# ===== Notification & Inbox Models =====

class NotificationType(str, Enum):
    SYSTEM = "system"
    INSTRUCTOR = "instructor"
    INSTITUTION = "institution"

class Notification(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    is_read: bool = False
    created_at: datetime

class Message(BaseModel):
    id: int
    sender_id: int
    sender_name: str
    content: str
    created_at: datetime
    is_read: bool = False

class MessageCreate(BaseModel):
    content: str

class Conversation(BaseModel):
    id: int
    participants: List[int] # List of user_ids
    participant_names: List[str] # List of names for display
    last_message: Optional[Message] = None
    updated_at: datetime
    messages: List[Message] = []


# ===== Blockchain Credential Models =====

class CredentialType(str, Enum):
    COURSE_COMPLETION = "course_completion"
    SPECIALIZATION = "specialization"
    DEGREE = "degree"
    SKILL_BADGE = "skill_badge"
    PROJECT_VERIFICATION = "project_verification"

class CredentialStatus(str, Enum):
    PENDING = "pending"
    MINTING = "minting"
    ISSUED = "issued"
    REVOKED = "revoked"

class Credential(ORMBase):
    """Blockchain-backed credential (SBT)"""
    id: int
    user_id: int
    course_id: Optional[int] = None
    project_id: Optional[int] = None
    
    # Credential details
    credential_type: CredentialType
    title: str
    description: str
    issuer_name: str  # Institution/Instructor name
    issuer_id: int
    
    # Blockchain data
    token_id: Optional[str] = None
    transaction_hash: Optional[str] = None
    blockchain_network: str = "Polygon"  # or "Hyperledger Indy"
    contract_address: Optional[str] = None
    wallet_address: Optional[str] = None
    
    # Metadata
    metadata_uri: Optional[str] = None  # IPFS/Arweave link
    metadata_json: Optional[Dict[str, Any]] = None
    
    # Verification
    status: CredentialStatus = CredentialStatus.PENDING
    verification_url: Optional[str] = None
    qr_code_url: Optional[str] = None
    
    # Dates
    issued_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None  # For skills that decay
    created_at: datetime
    updated_at: datetime

class CredentialCreate(BaseModel):
    """Request model for creating/minting a credential"""
    user_id: int
    course_id: Optional[int] = None
    project_id: Optional[int] = None
    credential_type: CredentialType
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., max_length=1000)
    issuer_name: str
    issuer_id: int
    wallet_address: str = Field(..., description="User's blockchain wallet address")
    expires_in_days: Optional[int] = None  # For skill decay

class CredentialVerification(BaseModel):
    """Public verification response"""
    is_valid: bool
    credential: Optional[Credential] = None
    verification_message: str
    verified_at: datetime


# ===== Code Execution Models =====

class CodeExecutionRequest(BaseModel):
    """Request to execute code"""
    code: str
    language: str = "python"
    project_id: Optional[int] = None


# ===== Code Persistence Models =====

class CodeSnapshot(BaseModel):
    """Code snapshot for version history"""
    id: int
    project_id: int
    code: str
    language: str = "python"
    timestamp: datetime
    auto_saved: bool = True
    file_name: Optional[str] = None  # e.g., "main.py", "main.js"

class CodeSnapshotCreate(BaseModel):
    """Request model for saving code snapshot"""
    project_id: int
    code: str
    language: str = "python"
    auto_saved: bool = True


# ===== PKC Models =====

class KnowledgeNodeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = None
    node_type: str = "concept"
    source_id: Optional[str] = None

class KnowledgeNode(ORMBase):
    id: int
    user_id: int
    title: str
    content: Optional[str] = None
    node_type: str
    source_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class KnowledgeLinkCreate(BaseModel):
    source_node_id: int
    target_node_id: int
    link_type: str = "related"
    weight: float = 1.0

class KnowledgeLink(ORMBase):
    id: int
    source_node_id: int
    target_node_id: int
    link_type: str
    weight: float
    created_at: datetime

class LearningJournalCreate(BaseModel):
    entry_type: str
    content: str
    tags: List[str] = []

class LearningJournal(ORMBase):
    id: int
    user_id: int
    entry_type: str
    content: str
    sentiment_score: Optional[float] = None
    tags: Optional[List[str]] = []
    created_at: datetime
