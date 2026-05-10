/**
 * Lesson Types for VOKASI2 Classroom
 * 
 * Defines lesson content structures for different lesson types.
 */

export type LessonType = 'slide' | 'quiz' | 'sandbox' | 'simulation' | 'video' | 'interactive';

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  lessonType: LessonType;
  orderIndex: number;
  content: LessonContent;
  settings: LessonSettings;
  estimatedMinutes: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonSettings {
  timeLimitSeconds?: number;
  passingScore?: number;
  showAnswers?: boolean;
  allowRetry?: boolean;
  maxAttempts?: number;
  autoAdvance?: boolean;
}

// Union type for all lesson content
export type LessonContent = 
  | SlideContent 
  | QuizContent 
  | SandboxContent 
  | VideoContent 
  | SimulationContent 
  | InteractiveContent;

// Slide lesson content
export interface SlideContent {
  type: 'slide';
  slides: Slide[];
}

export interface Slide {
  id: string;
  type: 'content' | 'image' | 'video' | 'code' | 'summary';
  title?: string;
  body: string; // Rich text HTML
  imageUrl?: string;
  videoUrl?: string;
  codeBlock?: {
    language: string;
    code: string;
  };
  notes?: string; // Speaker notes (for TTS)
}

// Quiz lesson content
export interface QuizContent {
  type: 'quiz';
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'code';
  question: string;
  options?: string[]; // For multiple-choice
  correctAnswer: string | number | string[];
  explanation?: string;
  points: number;
}

// Sandbox lesson content
export interface SandboxContent {
  type: 'sandbox';
  templateCode: string;
  language: 'python' | 'javascript' | 'typescript' | 'sql';
  instructions: string;
  testCases?: TestCase[];
  hints?: string[];
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description: string;
}

// Video lesson content
export interface VideoContent {
  type: 'video';
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // seconds
  chapters?: VideoChapter[];
  transcript?: string;
}

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
}

// Simulation lesson content
export interface SimulationContent {
  type: 'simulation';
  scenario: string;
  persona: {
    name: string;
    role: string;
    background: string;
  };
  objectives: string[];
  turns: SimulationTurn[];
}

export interface SimulationTurn {
  id: string;
  speaker: 'system' | 'user' | 'persona';
  content: string;
  expectedResponse?: string;
  feedback?: string;
}

// Interactive lesson content
export interface InteractiveContent {
  type: 'interactive';
  activityType: 'drag-drop' | 'matching' | 'fill-blank' | 'ordering';
  instructions: string;
  items: InteractiveItem[];
  correctOrder?: string[]; // For ordering activities
}

export interface InteractiveItem {
  id: string;
  content: string;
  matchId?: string; // For matching activities
}

// Lesson attempt tracking
export interface LessonAttempt {
  id: string;
  lessonId: string;
  userId: string;
  score: number | null;
  timeSpentSeconds: number | null;
  answers: Record<string, unknown>;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
}

// Classroom stage types
export interface ClassroomState {
  currentLessonIndex: number;
  lessons: Lesson[];
  progress: LessonProgress;
  isPlaying: boolean;
  playbackSpeed: number;
}

export interface LessonProgress {
  completedLessons: string[];
  currentLessonId: string | null;
  lessonScores: Record<string, number>;
  totalTimeSpent: number;
}
