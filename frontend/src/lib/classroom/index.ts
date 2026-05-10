/**
 * VOKASI2 Classroom Module
 * 
 * Lesson types, renderers, and classroom stage components.
 * Inspired by OpenMAIC's scene-based learning architecture.
 */

// Types
export type {
  LessonType,
  Lesson,
  LessonContent,
  LessonSettings,
  LessonAttempt,
  ClassroomState,
  LessonProgress,
  SlideContent,
  Slide,
  QuizContent,
  QuizQuestion,
  SandboxContent,
  TestCase,
  VideoContent,
  VideoChapter,
  SimulationContent,
  SimulationTurn,
  InteractiveContent,
  InteractiveItem,
} from './types';

// Components
export { LessonRenderer } from '@/components/classroom/lesson-renderer';
export { ClassroomStage } from '@/components/classroom/classroom-stage';

// Renderers (can be used individually)
export { SlideRenderer } from '@/components/classroom/renderers/slide-renderer';
export { QuizRenderer } from '@/components/classroom/renderers/quiz-renderer';
export { SandboxRenderer } from '@/components/classroom/renderers/sandbox-renderer';
export { VideoRenderer } from '@/components/classroom/renderers/video-renderer';
export { SimulationRenderer } from '@/components/classroom/renderers/simulation-renderer';
export { InteractiveRenderer } from '@/components/classroom/renderers/interactive-renderer';
