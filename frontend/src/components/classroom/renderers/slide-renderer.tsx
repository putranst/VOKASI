'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SpeechButton } from '@/components/tts/speech-button';
import type { SlideContent, Slide } from '@/lib/classroom/types';

interface SlideRendererProps {
  content: SlideContent;
  onComplete?: () => void;
  onSlideChange?: (index: number) => void;
}

export function SlideRenderer({ content, onComplete, onSlideChange }: SlideRendererProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const slides = content.slides;

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
      onSlideChange?.(index);
    }
  };

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      onComplete?.();
    } else {
      goToSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    goToSlide(currentSlide - 1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  if (!slide) {
    return <div className="text-muted-foreground">No slides available</div>;
  }

  return (
    <div
      className="flex flex-col h-full bg-card rounded-lg border"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          {slide.title && (
            <span className="text-sm text-muted-foreground">— {slide.title}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {slide.notes && (
            <SpeechButton text={slide.notes} variant="ghost" size="sm" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Slide content */}
      <div className="flex-1 p-6 overflow-auto">
        <SlideContent slide={slide} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {/* Slide dots */}
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <Button size="sm" onClick={handleNext}>
          {currentSlide === slides.length - 1 ? (
            'Complete'
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SlideContent({ slide }: { slide: Slide }) {
  switch (slide.type) {
    case 'content':
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: slide.body }}
        />
      );

    case 'image':
      return (
        <div className="flex flex-col items-center gap-4">
          {slide.imageUrl && (
            <img
              src={slide.imageUrl}
              alt={slide.title || 'Slide image'}
              className="max-w-full max-h-[60vh] object-contain rounded-lg"
            />
          )}
          {slide.body && (
            <div
              className="prose prose-sm max-w-none text-center"
              dangerouslySetInnerHTML={{ __html: slide.body }}
            />
          )}
        </div>
      );

    case 'video':
      return (
        <div className="flex flex-col gap-4">
          {slide.videoUrl && (
            <video
              src={slide.videoUrl}
              controls
              className="w-full max-h-[60vh] rounded-lg"
            />
          )}
          {slide.body && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: slide.body }}
            />
          )}
        </div>
      );

    case 'code':
      return (
        <div className="space-y-4">
          {slide.body && (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: slide.body }}
            />
          )}
          {slide.codeBlock && (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code className={`language-${slide.codeBlock.language}`}>
                {slide.codeBlock.code}
              </code>
            </pre>
          )}
        </div>
      );

    case 'summary':
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{slide.title || 'Summary'}</h2>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: slide.body }}
          />
        </div>
      );

    default:
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: slide.body }}
        />
      );
  }
}
