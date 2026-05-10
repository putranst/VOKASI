'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { VideoContent, VideoChapter } from '@/lib/classroom/types';

interface VideoRendererProps {
  content: VideoContent;
  onComplete?: () => void;
}

export function VideoRenderer({ content, onComplete }: VideoRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeChapter, setActiveChapter] = useState<VideoChapter | null>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Find active chapter
      if (content.chapters) {
        const chapter = [...content.chapters]
          .reverse()
          .find((c) => video.currentTime >= c.startTime);
        setActiveChapter(chapter || null);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [content, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const seekToChapter = (chapter: VideoChapter) => {
    seekTo(chapter.startTime);
    setActiveChapter(chapter);
    if (!isPlaying) {
      videoRef.current?.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border overflow-hidden">
      {/* Video Player */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={content.videoUrl}
          poster={content.thumbnailUrl}
          className="w-full aspect-video"
          onClick={togglePlay}
        />
        
        {/* Play/Pause overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity"
        >
          {isPlaying ? (
            <Pause className="h-16 w-16 text-white" />
          ) : (
            <Play className="h-16 w-16 text-white" />
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <span className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration || content.duration)}
          </span>
        </div>
        
        <Progress
          value={progress}
          className="cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            seekTo(percentage * duration);
          }}
        />
      </div>

      {/* Chapters */}
      {content.chapters && content.chapters.length > 0 && (
        <div className="p-4 border-t bg-muted/30">
          <h4 className="text-sm font-medium mb-2">Chapters</h4>
          <div className="flex flex-wrap gap-2">
            {content.chapters.map((chapter) => (
              <Button
                key={chapter.id}
                variant={activeChapter?.id === chapter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => seekToChapter(chapter)}
              >
                {formatTime(chapter.startTime)} - {chapter.title}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Transcript (if available) */}
      {content.transcript && (
        <div className="p-4 border-t max-h-32 overflow-auto">
          <h4 className="text-sm font-medium mb-2">Transcript</h4>
          <p className="text-sm text-muted-foreground">{content.transcript}</p>
        </div>
      )}
    </div>
  );
}
