// VOKASI2 — Core TypeScript Types (PRD v2.3 §6.2)

export type UserRole = "student" | "instructor" | "admin" | "mentor";

export type ChallengeDomain =
  | "prompt_engineering"
  | "model_evaluation"
  | "ai_ethics"
  | "data_analysis"
  | "automation";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type SubmissionStatus = "draft" | "submitted" | "evaluated";

export type SandboxTemplate = "jupyter" | "playground" | "sql" | "no_code";

export type SandboxStatus = "active" | "paused" | "terminated";

export type CourseStatus = "draft" | "published" | "archived";

export type InstitutionPlan = "free" | "student_pro" | "institution" | "enterprise";

// ─── User & Auth ───────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  role: UserRole;
  institutionId?: string;
  nisn?: string; // SMK students
  nim?: string; // University students
  avatarUrl?: string;
  competencyVector: number[]; // 12-dim, pgvector
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  name: string;
  domain?: string;
  plan: InstitutionPlan;
  branding?: InstitutionBranding;
  createdAt: string;
}

export interface InstitutionBranding {
  primaryColor?: string;
  logoUrl?: string;
  platformName?: string;
}

// ─── Challenge Arena ────────────────────────────────────────────

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rubric: Rubric;
  difficulty: Difficulty;
  domainTags: ChallengeDomain[];
  sandboxTemplateId?: string;
  maxAttempts: number;
  timeLimitMinutes?: number;
  isWeekly: boolean;
  rotationWeek?: number;
  createdAt: string;
}

export interface Rubric {
  decomposition: { weight: number; description: string };
  toolUsage: { weight: number; description: string };
  outputQuality: { weight: number; description: string };
  reflection: { weight: number; description: string };
}

export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  content: SubmissionContent;
  reflectionText: string;
  aiFeedback?: AIFeedback;
  peerReviews?: PeerReview[];
  competencyDelta?: Record<string, number>;
  versionNumber: number;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionContent {
  code?: string;
  memo?: string;
  files?: { name: string; content: string }[];
}

export interface AIFeedback {
  scores: {
    decomposition: number;
    toolUsage: number;
    outputQuality: number;
    reflection: number;
  };
  narrative: string;
  suggestedResources?: string[];
}

export interface PeerReview {
  reviewerId: string;
  scores: Record<string, number>;
  narrative: string;
  createdAt: string;
}

// ─── SocraticChat ──────────────────────────────────────────────

export type TutorMode = "guide" | "devils_advocate" | "peer";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: TutorMode;
  createdAt: string;
}

export interface TutorSession {
  id: string;
  userId: string;
  mode: TutorMode;
  messages: TutorMessage[];
  context?: {
    currentChallengeId?: string;
    currentProjectId?: string;
  };
  createdAt: string;
}

// ─── Portfolio ─────────────────────────────────────────────────

export interface Portfolio {
  id: string;
  userId: string;
  publicUrlSlug: string;
  artifacts: Artifact[];
  competencyHeatmap: CompetencyHeatmap;
  failureResume: FailureEntry[];
  endorsements: Endorsement[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Artifact {
  id: string;
  type: "challenge_submission" | "project" | "reflection" | "certificate" | "other";
  title: string;
  description: string;
  challengeId?: string;
  submissionId?: string;
  version?: string;
  contentUrl?: string;
  createdAt: string;
}

export interface CompetencyHeatmap {
  promptEngineering: number;
  modelEvaluation: number;
  dataEthics: number;
  automation: number;
  criticalThinking: number;
  collaboration: number;
  communication: number;
  toolFluency: number;
  debugging: number;
  domainApplication: number;
  continuousLearning: number;
  teachingOthers: number;
}

export interface FailureEntry {
  id: string;
  context: string;
  whatWentWrong: string;
  whatILearned: string;
  whatIDoDifferently: string;
  createdAt: string;
}

export interface Endorsement {
  id: string;
  mentorId: string;
  mentorName: string;
  skill: keyof CompetencyHeatmap;
  comment: string;
  createdAt: string;
}

// ─── Sandbox ───────────────────────────────────────────────────

export interface SandboxSession {
  id: string;
  userId: string;
  templateId: SandboxTemplate;
  containerId?: string;
  stateUrl?: string;
  versionHistory: SandboxSnapshot[];
  mistakeLog: MistakeEntry[];
  resourceUsage?: ResourceUsage;
  status: SandboxStatus;
  createdAt: string;
  expiresAt: string;
}

export interface SandboxSnapshot {
  id: string;
  content: Record<string, unknown>;
  timestamp: string;
}

export interface MistakeEntry {
  id: string;
  errorType: string;
  errorMessage: string;
  reflection?: string;
  timestamp: string;
}

export interface ResourceUsage {
  cpuSeconds: number;
  memoryMb: number;
  diskMb: number;
}

// ─── Courses ───────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  institutionId?: string;
  status: CourseStatus;
  structure: CourseBlock[];
  competencyWeights: Record<string, number>;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CourseBlock =
  | VideoBlock
  | InteractiveScenarioBlock
  | CodeSandboxBlock
  | ReflectionPromptBlock
  | PeerReviewBlock
  | AIChallengeBlock
  | QuizBlock;

export interface VideoBlock {
  type: "video";
  id: string;
  title: string;
  url: string;
  durationMinutes: number;
}

export interface InteractiveScenarioBlock {
  type: "interactive_scenario";
  id: string;
  title: string;
  scenarioTree: Record<string, unknown>;
}

export interface CodeSandboxBlock {
  type: "code_sandbox";
  id: string;
  title: string;
  template: SandboxTemplate;
}

export interface ReflectionPromptBlock {
  type: "reflection_prompt";
  id: string;
  title: string;
  promptText: string;
}

export interface PeerReviewBlock {
  type: "peer_review";
  id: string;
  title: string;
  instructions: string;
}

export interface AIChallengeBlock {
  type: "ai_challenge";
  id: string;
  title: string;
  challengeId: string;
}

export interface QuizBlock {
  type: "quiz";
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

// ─── Analytics ─────────────────────────────────────────────────

export interface StudentAnalytics {
  userId: string;
  competencyHeatmap: CompetencyHeatmap;
  competencyVelocity: number; // avg monthly change
  reflectionDepthScore: number; // 0-10
  challengeHistory: {
    challengeId: string;
    attempts: number;
    bestScore: number;
    lastAttemptAt: string;
  }[];
  sandboxHours: number;
  socraticCirclesAttended: number;
}

export interface InstructorAnalytics {
  courseId: string;
  cohortHeatmap: CompetencyHeatmap; // averaged across students
  competencyGaps: { dimension: string; gap: number }[];
  commonFailureModes: { mode: string; frequency: number }[];
  engagementRate: number; // % attempting weekly challenges
  averageReflectionDepth: number;
}

export interface AdminAnalytics {
  institutionId?: string;
  aiReadinessIndex: number;
  totalStudents: number;
  totalInstructors: number;
  activeChallenges: number;
  institutionPlan: InstitutionPlan;
}
