'use client';

import { useMemo } from 'react';
import type { Lesson, LessonContent } from '@/lib/classroom/types';
import { SlideRenderer } from './renderers/slide-renderer';
import { QuizRenderer } from './renderers/quiz-renderer';
import { SandboxRenderer } from './renderers/sandbox-renderer';
import { VideoRenderer } from './renderers/video-renderer';
import { SimulationRenderer } from './renderers/simulation-renderer';
import { InteractiveRenderer } from './renderers/interactive-renderer';

interface LessonRendererProps {
  lesson: Lesson;
  onComplete?: (score?: number) => void;
  onProgress?: (slideIndex: number) => void;
}

export function LessonRenderer({ lesson, onComplete, onProgress }: LessonRendererProps) {
  const content = lesson.content;

  const renderer = useMemo(() => {
    switch (lesson.lessonType) {
      case 'slide':
        if (content.type !== 'slide') return <InvalidContent type="slide" />;
        return (
          <SlideRenderer
            content={content}
            onComplete={onComplete}
            onSlideChange={onProgress}
          />
        );

      case 'quiz':
        if (content.type !== 'quiz') return <InvalidContent type="quiz" />;
        return (
          <QuizRenderer
            content={content}
            settings={lesson.settings}
            onComplete={(score) => onComplete?.(score)}
          />
        );

      case 'sandbox':
        if (content.type !== 'sandbox') return <InvalidContent type="sandbox" />;
        return (
          <SandboxRenderer
            content={content}
            onComplete={onComplete}
          />
        );

      case 'video':
        if (content.type !== 'video') return <InvalidContent type="video" />;
        return (
          <VideoRenderer
            content={content}
            onComplete={onComplete}
          />
        );

      case 'simulation':
        if (content.type !== 'simulation') return <InvalidContent type="simulation" />;
        return (
          <SimulationRenderer
            content={content}
            onComplete={onComplete}
          />
        );

      case 'interactive':
        if (content.type !== 'interactive') return <InvalidContent type="interactive" />;
        return (
          <InteractiveRenderer
            content={content}
            onComplete={onComplete}
          />
        );

      default:
        return <UnknownType type={lesson.lessonType} />;
    }
  }, [lesson, content, onComplete, onProgress]);

  return (
    <div className="w-full h-full min-h-[400px]">
      {renderer}
    </div>
  );
}

function InvalidContent({ type }: { type: string }) {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Invalid content for {type} lesson
    </div>
  );
}

function UnknownType({ type }: { type: string }) {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Unknown lesson type: {type}
    </div>
  );
}
