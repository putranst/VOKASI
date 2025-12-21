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


# ===== IRIS Framework Models (NUSA - National Upskilling Sprint for AI) =====
# The IRIS Cycle: Immerse → Realize → Iterate → Scale
# Replaces CDIO for Ekspedisi AI Nusantara 2026

class IRISPhase(str, Enum):
    """IRIS Cycle phases for NUSA Framework (4-week intensive sprint)"""
    IMMERSE = "immerse"          # Days 1-5: Live in authentic problem context
    REALIZE = "realize"          # Days 5-10: Gap analysis & SFIA mapping
    ITERATE = "iterate"          # Days 10-25: Build-Measure-Learn cycles
    SCALE = "scale"              # Days 25-28+: Institutional deployment

# Backward compatibility alias - maps to IRIS phases
class CDIOPhase(str, Enum):
    """DEPRECATED: Use IRISPhase instead. Kept for backward compatibility."""
    CONCEIVE = "immerse"     # Maps to IRIS Immerse
    DESIGN = "realize"       # Maps to IRIS Realize
    IMPLEMENT = "iterate"    # Maps to IRIS Iterate
    OPERATE = "scale"        # Maps to IRIS Scale

class SFIALevel(str, Enum):
    """SFIA (Skills Framework for the Information Age) competency levels"""
    L1_AWARENESS = "L1"      # Knows what the skill is; can explain in general terms
    L2_WORKING = "L2"        # Can apply the skill; seeks guidance on complex situations
    L3_PROFICIENT = "L3"     # Applies reliably; takes responsibility; mentors juniors
    L4_EXPERT = "L4"         # Designs approaches; shapes organizational capability
    L5_VISIONARY = "L5"      # Strategic impact; innovation; policy influence

class HexaHelixSector(str, Enum):
    """Hexa-Helix collaboration model sectors"""
    GOVERNMENT = "government"    # Pemerintah Daerah (Pemda)
    ACADEMIA = "academia"        # Pendidikan (Kampus)
    INDUSTRY = "industry"        # Industri (SME/Enterprise)
    COMMUNITY = "community"      # Komunitas (Civil Society)
    MEDIA = "media"              # Media (Communication)
    FINANCE = "finance"          # Keuangan (Development Banks, VCs)

class ProjectStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


# ===== SFIA Competency Models =====

class SFIACompetencyCreate(BaseModel):
    """Request model for adding SFIA competency target"""
    skill_code: str = Field(..., description="SFIA skill code, e.g., 'DATM' for Data Management")
    skill_name: str = Field(..., description="Human-readable skill name")
    target_level: SFIALevel = Field(..., description="Target competency level")
    current_level: Optional[SFIALevel] = Field(None, description="Current assessed level")
    evidence_notes: Optional[str] = Field(None, max_length=500)

class SFIACompetency(ORMBase):
    """SFIA competency mapping for user or project"""
    id: int
    user_id: Optional[int] = None
    project_id: Optional[int] = None
    skill_code: str
    skill_name: str
    target_level: SFIALevel
    current_level: Optional[SFIALevel] = None
    evidence_notes: Optional[str] = None
    assessed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# ===== NUSA Sprint Models =====

class NUSASprintCreate(BaseModel):
    """Request model for creating a NUSA Sprint (4-week intensive)"""
    province: str = Field(..., description="Indonesian province name")
    province_code: str = Field(..., description="Province code, e.g., 'JB' for Jawa Barat")
    start_date: datetime
    end_date: datetime
    max_participants: int = Field(default=3000, ge=100, le=5000)
    helix_partners: Optional[Dict[str, str]] = Field(None, description="Partner organizations by sector")

class NUSASprint(ORMBase):
    """NUSA Sprint - Provincial 4-week AI Upskilling Bootcamp"""
    id: int
    province: str
    province_code: str
    start_date: datetime
    end_date: datetime
    max_participants: int
    current_participants: int = 0
    helix_partners: Optional[Dict[str, str]] = None  # {"government": "Pemda Jabar", ...}
    status: str = "upcoming"  # upcoming, active, completed
    created_at: datetime
    updated_at: datetime


# ===== Immersion Phase Models (formerly Conceive) =====

class ImmersionArtifactCreate(BaseModel):
    """Request model for Immersion phase artifacts"""
    problem_context: str = Field(..., min_length=50, max_length=2000, description="Observed problem in authentic context")
    stakeholder_map: Optional[str] = Field(None, max_length=1000, description="Who is affected or involved")
    empathy_notes: Optional[str] = Field(None, max_length=1000, description="Observations from immersion")
    sfia_targets: Optional[List[str]] = Field(None, description="Target SFIA skill codes")
    institutional_anchor: Optional[str] = Field(None, description="Government office, SME, or institution")

class ImmersionArtifact(ORMBase):
    """Immersion phase output (IRIS Phase 1)"""
    id: int
    project_id: int
    problem_context: str
    stakeholder_map: Optional[str] = None
    empathy_notes: Optional[str] = None
    sfia_targets: List[str] = []
    institutional_anchor: Optional[str] = None
    # AI-generated fields
    suggested_competencies: List[str] = []
    difficulty_assessment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Backward compatibility aliases
ProjectCharterCreate = ImmersionArtifactCreate

class ProjectCharter(BaseModel):
    """DEPRECATED: Use ImmersionArtifact. Kept for backward compatibility."""
    id: int
    project_id: int
    problem_statement: str  # Maps to problem_context
    success_metrics: str
    target_outcome: Optional[str] = None
    constraints: Optional[str] = None
    stakeholders: Optional[str] = None
    suggested_tools: List[str] = []
    reasoning: Optional[str] = None
    estimated_duration: Optional[str] = None
    difficulty_level: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ===== Reflection Phase Models (formerly Design) =====

class ReflectionArtifactCreate(BaseModel):
    """Request model for Reflection phase artifacts"""
    gap_analysis: str = Field(..., min_length=50, max_length=2000, description="Analysis of knowledge/skill gaps")
    sfia_assessment: Optional[Dict[str, str]] = Field(None, description="Self-assessment against SFIA descriptors")
    learning_plan: Optional[str] = Field(None, max_length=1000, description="What P (programmed knowledge) is needed")
    question_log: Optional[List[str]] = Field(None, description="Key questions from Socratic reflection")
    architecture_sketch: Optional[Dict[str, Any]] = Field(None, description="Initial solution architecture")

class ReflectionArtifact(ORMBase):
    """Reflection phase output (IRIS Phase 2)"""
    id: int
    project_id: int
    gap_analysis: str
    sfia_assessment: Optional[Dict[str, str]] = None  # {"DATM": "L2", "PROG": "L3"}
    learning_plan: Optional[str] = None
    question_log: List[str] = []
    architecture_sketch: Optional[Dict[str, Any]] = None
    ai_validation_score: Optional[float] = None
    validation_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Backward compatibility alias
DesignBlueprintCreate = ReflectionArtifactCreate

class DesignBlueprint(BaseModel):
    """DEPRECATED: Use ReflectionArtifact. Kept for backward compatibility."""
    id: int
    project_id: int
    architecture_diagram: Optional[Dict[str, Any]] = None
    logic_flow: Optional[str] = None
    component_list: List[str] = []
    data_flow: Optional[str] = None
    ai_validation_score: Optional[float] = None
    validation_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ===== Iteration Phase Models (formerly Implement) =====

class IterationArtifactCreate(BaseModel):
    """Request model for Iteration phase artifacts (Build-Measure-Learn)"""
    iteration_number: int = Field(default=1, ge=1, description="Current BML cycle number")
    hypothesis: Optional[str] = Field(None, max_length=500, description="What we're testing this iteration")
    prototype_url: Optional[str] = None
    code_snapshot: Optional[str] = Field(None, description="Code content snapshot")
    measurements: Optional[Dict[str, Any]] = Field(None, description="Metrics from this iteration")
    learnings: Optional[str] = Field(None, max_length=1000, description="What we learned")
    next_hypothesis: Optional[str] = Field(None, max_length=500, description="Next iteration hypothesis")

class IterationArtifact(ORMBase):
    """Iteration phase output (IRIS Phase 3 - Build-Measure-Learn cycles)"""
    id: int
    project_id: int
    iteration_number: int = 1
    hypothesis: Optional[str] = None
    prototype_url: Optional[str] = None
    code_snapshot: Optional[str] = None
    measurements: Optional[Dict[str, Any]] = None
    learnings: Optional[str] = None
    next_hypothesis: Optional[str] = None
    linting_passed: bool = False
    tests_passed: bool = False
    created_at: datetime
    updated_at: datetime

# Backward compatibility alias
ImplementationCreate = IterationArtifactCreate

class Implementation(BaseModel):
    """DEPRECATED: Use IterationArtifact. Kept for backward compatibility."""
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


# ===== Scale Phase Models (formerly Operate) =====

class ScaleArtifactCreate(BaseModel):
    """Request model for Scale phase artifacts (Institutional deployment)"""
    deployment_url: Optional[str] = None
    deployment_platform: Optional[str] = None
    institutional_handoff: Optional[str] = Field(None, max_length=1000, description="Documentation for institution")
    stakeholder_training: Optional[str] = Field(None, max_length=1000, description="Training provided to stakeholders")
    impact_metrics: Optional[Dict[str, Any]] = Field(None, description="Measured impact on institution")
    sfia_evidence: Optional[Dict[str, str]] = Field(None, description="Evidence for SFIA competency assessment")

class ScaleArtifact(ORMBase):
    """Scale phase output (IRIS Phase 4 - Institutional deployment + credential)"""
    id: int
    project_id: int
    deployment_url: Optional[str] = None
    deployment_platform: Optional[str] = None
    institutional_handoff: Optional[str] = None
    stakeholder_training: Optional[str] = None
    impact_metrics: Optional[Dict[str, Any]] = None
    sfia_evidence: Optional[Dict[str, str]] = None
    verification_status: ProjectStatus = ProjectStatus.SUBMITTED
    verification_tests_passed: int = 0
    verification_tests_total: int = 0
    # Credential fields
    credential_issued: bool = False
    credential_type: Optional[str] = None  # "nusantara_ai_fellow"
    sfia_level_achieved: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Backward compatibility alias
DeploymentCreate = ScaleArtifactCreate

class Deployment(BaseModel):
    """DEPRECATED: Use ScaleArtifact. Kept for backward compatibility."""
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


# ===== IRIS Project Core Model =====

class IRISProjectCreate(BaseModel):
    """Request model for creating a new IRIS project (NUSA Framework)"""
    course_id: Optional[int] = None
    sprint_id: Optional[int] = None  # For NUSA Sprint participants
    user_id: int
    project_title: Optional[str] = Field(None, max_length=200)
    institutional_anchor: Optional[str] = Field(None, description="Government/SME/Institution hosting the problem")

class IRISProject(ORMBase):
    """Main IRIS project model tracking all phases (NUSA Framework)"""
    id: int
    course_id: Optional[int] = None
    sprint_id: Optional[int] = None
    user_id: int
    project_title: str = Field(validation_alias="title")
    current_phase: IRISPhase = IRISPhase.IMMERSE
    overall_status: ProjectStatus = ProjectStatus.NOT_STARTED
    
    # Phase completion tracking (IRIS phases)
    immersion_completed: bool = False
    reflection_completed: bool = False
    iteration_completed: bool = False
    scale_completed: bool = False
    
    # References to phase artifacts
    immersion_artifact_id: Optional[int] = None
    reflection_artifact_id: Optional[int] = None
    iteration_artifact_id: Optional[int] = None
    scale_artifact_id: Optional[int] = None
    
    # SFIA tracking
    target_sfia_level: Optional[str] = None
    achieved_sfia_level: Optional[str] = None
    sfia_competencies: List[str] = []  # List of skill codes
    
    # Progress tracking
    completion_percentage: int = 0
    sprint_day: Optional[int] = None  # Day 1-28 of the NUSA Sprint
    started_at: datetime
    completed_at: Optional[datetime] = None
    last_activity_at: datetime

# Backward compatibility alias
CDIOProjectCreate = IRISProjectCreate
CDIOProject = IRISProject

class IRISProjectDetail(BaseModel):
    """Detailed IRIS project view with all phase data"""
    project: IRISProject
    immersion: Optional[ImmersionArtifact] = None
    reflection: Optional[ReflectionArtifact] = None
    iteration: Optional[IterationArtifact] = None
    scale: Optional[ScaleArtifact] = None
    sfia_competencies: List[SFIACompetency] = []

# Backward compatibility alias  
CDIOProjectDetail = IRISProjectDetail


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
    career_pathway_id: Optional[str] = None  # ID from careerData.ts


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
