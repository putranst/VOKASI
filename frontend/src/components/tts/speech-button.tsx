'use client';

import { useState, useCallback } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useTTS } from '@/lib/tts/use-tts';
import { TTS_PROVIDERS } from '@/lib/tts/constants';

interface SpeechButtonProps {
  text: string;
  className?: string;
  showDuration?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function SpeechButton({ 
  text, 
  className = '', 
  showDuration = false,
  variant = 'ghost',
  size = 'sm'
}: SpeechButtonProps) {
  const { status, play, stop, pause, resume, isPlaying } = useTTS();
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = useCallback(() => {
    if (status === 'loading') return;
    
    if (isPlaying) {
      pause();
    } else if (status === 'paused') {
      resume();
    } else {
      play(text);
    }
  }, [status, isPlaying, text, play, pause, resume]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className={`
          inline-flex items-center justify-center rounded-md
          transition-colors focus-visible:outline-none focus-visible:ring-2
          disabled:pointer-events-none disabled:opacity-50
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        title={isPlaying ? 'Pause' : status === 'paused' ? 'Resume' : 'Listen to this text'}
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="h-4 w-4" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </button>

      {/* Stop button when playing */}
      {(isPlaying || status === 'paused') && (
        <button
          onClick={handleStop}
          className={`
            ml-1 inline-flex items-center justify-center rounded-md
            bg-destructive/10 text-destructive hover:bg-destructive/20
            transition-colors
            ${sizeClasses[size]}
          `}
          title="Stop"
        >
          <VolumeX className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

/**
 * Inline speech button for content blocks
 */
export function InlineSpeechButton({ text }: { text: string }) {
  return (
    <SpeechButton
      text={text}
      variant="ghost"
      size="sm"
      className="ml-2 opacity-50 hover:opacity-100"
    />
  );
}

/**
 * Floating TTS control bar
 */
interface TTSControlBarProps {
  text: string;
  onVoiceChange?: (voiceId: string) => void;
}

export function TTSControlBar({ text, onVoiceChange }: TTSControlBarProps) {
  const { status, config, play, stop, pause, resume, isPlaying, setConfig } = useTTS();

  const voices = TTS_PROVIDERS[config.providerId]?.voices || [];

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
      <SpeechButton text={text} size="md" />
      
      <select
        value={config.voiceId}
        onChange={(e) => setConfig({ voiceId: e.target.value })}
        className="rounded border bg-background px-2 py-1 text-sm"
      >
        {voices.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name} ({voice.language})
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Speed:</span>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={config.speed}
          onChange={(e) => setConfig({ speed: parseFloat(e.target.value) })}
          className="w-20"
        />
        <span className="text-xs w-8">{config.speed.toFixed(1)}x</span>
      </div>

      {status === 'loading' && (
        <span className="text-xs text-muted-foreground">Loading...</span>
      )}
    </div>
  );
}
