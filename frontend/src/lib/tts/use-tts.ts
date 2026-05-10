/**
 * TTS React Hook for VOKASI2
 * 
 * Provides easy-to-use text-to-speech functionality for components.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TTSConfig, TTSStatus } from './types';
import { DEFAULT_TTS_CONFIG, TTS_PROVIDERS } from './constants';
import { generateTTS, estimateDuration } from './tts-utils';

interface UseTTSReturn {
  status: TTSStatus;
  config: TTSConfig;
  isPlaying: boolean;
  duration: number | null;
  error: string | null;
  play: (text: string) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setConfig: (config: Partial<TTSConfig>) => void;
}

export function useTTS(initialConfig?: Partial<TTSConfig>): UseTTSReturn {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [config, setConfigState] = useState<TTSConfig>({
    ...DEFAULT_TTS_CONFIG,
    ...initialConfig,
  });
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTextRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback(async (text: string) => {
    if (!config.enabled) return;
    
    try {
      setError(null);
      setStatus('loading');
      currentTextRef.current = text;
      setDuration(estimateDuration(text, config.speed));

      // Browser-native TTS
      if (config.providerId === 'browser-native') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = config.speed;
          utterance.onstart = () => setStatus('playing');
          utterance.onend = () => setStatus('idle');
          utterance.onerror = (e) => {
            setError(e.error);
            setStatus('error');
          };
          window.speechSynthesis.speak(utterance);
        }
        return;
      }

      // Server-side TTS (Edge, OpenAI)
      const audioUrl = await generateTTS({
        text,
        providerId: config.providerId,
        voiceId: config.voiceId,
        speed: config.speed,
      });

      // Create and play audio element
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => setStatus('playing');
      audio.onpause = () => setStatus('paused');
      audio.onended = () => {
        setStatus('idle');
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setError('Failed to play audio');
        setStatus('error');
      };

      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TTS failed');
      setStatus('error');
    }
  }, [config]);

  const stop = useCallback(() => {
    if (config.providerId === 'browser-native') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStatus('idle');
    currentTextRef.current = null;
  }, [config.providerId]);

  const pause = useCallback(() => {
    if (config.providerId === 'browser-native') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.pause();
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [config.providerId]);

  const resume = useCallback(() => {
    if (config.providerId === 'browser-native') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.resume();
      }
    } else if (audioRef.current) {
      audioRef.current.play();
    }
  }, [config.providerId]);

  const setConfig = useCallback((updates: Partial<TTSConfig>) => {
    setConfigState((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    status,
    config,
    isPlaying: status === 'playing',
    duration,
    error,
    play,
    stop,
    pause,
    resume,
    setConfig,
  };
}
