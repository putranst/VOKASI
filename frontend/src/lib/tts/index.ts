/**
 * VOKASI2 TTS Module
 * 
 * Text-to-Speech integration for course content.
 */

// Types
export type {
  TTSProviderId,
  TTSVoice,
  TTSProviderConfig,
  TTSRequest,
  TTSResponse,
  TTSConfig,
  TTSStatus,
  TTSState,
} from './types';

// Constants
export { TTS_PROVIDERS, DEFAULT_TTS_CONFIG, getBrowserVoices } from './constants';

// Utilities
export { generateTTS, getVoicesForProvider, estimateDuration } from './tts-utils';

// Hook
export { useTTS } from './use-tts';

// Components
export { SpeechButton, InlineSpeechButton, TTSControlBar } from '@/components/tts/speech-button';
