'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { LessonRenderer } from './lesson-renderer';
import type { Lesson, ClassroomState, LessonProgress } from '@/lib/classroom/types';

interface ClassroomStageProps {
  lessons: Lesson[];
  initialLessonIndex?: number;
  onComplete?: (lessonId: string, score?: number) => void;
  onProgress?: (progress: LessonProgress) => void;
}

export function ClassroomStage({
  lessons,
  initialLessonIndex = 0,
  onComplete,
  onProgress,
}: ClassroomStageProps) {
  const [currentIndex, setCurrentIndex] = useState(initialLessonIndex);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lessonScores, setLessonScores] = useState<Record<string, number>>({});

  const currentLesson = lessons[currentIndex];
  const totalProgress = (completedLessons.length / lessons.length) * 100;

  const goToLesson = (index: number) => {
    if (index >= 0 && index < lessons.length) {
      setCurrentIndex(index);
    }
  };

  const handleLessonComplete = useCallback(
    (score?: number) => {
      if (!currentLesson) return;

      const lessonId = currentLesson.id;
      if (!completedLessons.includes(lessonId)) {
        setCompletedLessons((prev) => [...prev, lessonId]);
      }

      if (score !== undefined) {
        setLessonScores((prev) => ({ ...prev, [lessonId]: score }));
      }

      onComplete?.(lessonId, score);

      // Update progress
      const newProgress: LessonProgress = {
        completedLessons: [...completedLessons, lessonId],
        currentLessonId: lessonId,
        lessonScores: { ...lessonScores, [lessonId]: score || 0 },
        totalTimeSpent: 0, // Would track actual time in real implementation
      };
      onProgress?.(newProgress);

      // Auto-advance to next lesson
      if (currentIndex < lessons.length - 1) {
        setTimeout(() => goToLesson(currentIndex + 1), 1500);
      }
    },
    [currentLesson, completedLessons, lessonScores, currentIndex, lessons.length, onComplete, onProgress]
  );

  const handleSlideProgress = useCallback(
    (slideIndex: number) => {
      // Could track slide progress here
    },
    []
  );

  if (!currentLesson) {
    return (
      <Card className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No lessons available</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with lesson progress */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToLesson(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-medium">{currentLesson.title}</h2>
            <p className="text-sm text-muted-foreground">
              Lesson {currentIndex + 1} of {lessons.length}
              {currentLesson.estimatedMinutes && ` • ~${currentLesson.estimatedMinutes} min`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToLesson(currentIndex + 1)}
            disabled={currentIndex === lessons.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {completedLessons.length}/{lessons.length} completed
          </span>
          <Progress value={totalProgress} className="w-24" />
        </div>
      </div>

      {/* Lesson sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Lesson list sidebar */}
        <div className="w-48 border-r bg-muted/20 overflow-y-auto p-2">
          <h3 className="text-xs font-medium text-muted-foreground px-2 py-1">
            LESSONS
          </h3>
          <div className="space-y-1">
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isCurrent = index === currentIndex;
              const score = lessonScores[lesson.id];

              return (
                <button
                  key={lesson.id}
                  onClick={() => goToLesson(index)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left text-sm transition-colors ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0" />
                  )}
                  <span className="truncate flex-1">{lesson.title}</span>
                  {score !== undefined && (
                    <span className="text-xs opacity-70">{score}%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main lesson content */}
        <div className="flex-1 p-4 overflow-auto">
          <LessonRenderer
            lesson={currentLesson}
            onComplete={handleLessonComplete}
            onProgress={handleSlideProgress}
          />
        </div>
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToLesson(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => goToLesson(currentIndex + 1)}
            disabled={currentIndex === lessons.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
