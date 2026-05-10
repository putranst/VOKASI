/**
 * TTS (Text-to-Speech) Types for VOKASI2
 * 
 * Supports multiple providers with extensible architecture.
 */

export type TTSProviderId = 'openai' | 'edge-tts' | 'browser-native';

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  sampleRate?: number;
}

export interface TTSProviderConfig {
  id: TTSProviderId;
  name: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  voices: TTSVoice[];
  supportedFormats: ('mp3' | 'wav' | 'ogg' | 'pcm')[];
  speedRange: {
    min: number;
    max: number;
    default: number;
  };
}

export interface TTSRequest {
  text: string;
  providerId: TTSProviderId;
  voiceId: string;
  speed?: number;
  format?: 'mp3' | 'wav' | 'ogg';
}

export interface TTSResponse {
  audioUrl: string;
  duration?: number;
  provider: TTSProviderId;
  voiceId: string;
}

export interface TTSConfig {
  providerId: TTSProviderId;
  voiceId: string;
  speed: number;
  enabled: boolean;
}

export type TTSStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface TTSState {
  status: TTSStatus;
  currentText: string | null;
  audioElement: HTMLAudioElement | null;
  config: TTSConfig;
  error: string | null;
}
