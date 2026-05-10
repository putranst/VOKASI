/**
 * TTS Provider Constants for VOKASI2
 * 
 * Voice configurations for each provider.
 */

import type { TTSProviderConfig } from './types';

export const TTS_PROVIDERS: Record<string, TTSProviderConfig> = {
  'edge-tts': {
    id: 'edge-tts',
    name: 'Edge TTS (Free)',
    requiresApiKey: false,
    voices: [
      // Indonesian voices
      { id: 'id-ID-ArdiNeural', name: 'Ardi', language: 'id-ID', gender: 'male' },
      { id: 'id-ID-GadisNeural', name: 'Gadis', language: 'id-ID', gender: 'female' },
      // English voices
      { id: 'en-US-GuyNeural', name: 'Guy', language: 'en-US', gender: 'male' },
      { id: 'en-US-JennyNeural', name: 'Jenny', language: 'en-US', gender: 'female' },
      { id: 'en-GB-ThomasNeural', name: 'Thomas', language: 'en-GB', gender: 'male' },
      { id: 'en-GB-LibbyNeural', name: 'Libby', language: 'en-GB', gender: 'female' },
      // Malay voices
      { id: 'ms-MY-OsmanNeural', name: 'Osman', language: 'ms-MY', gender: 'male' },
      { id: 'ms-MY-YasminNeural', name: 'Yasmin', language: 'ms-MY', gender: 'female' },
    ],
    supportedFormats: ['mp3', 'wav', 'ogg'],
    speedRange: { min: 0.5, max: 2.0, default: 1.0 },
  },
  'openai': {
    id: 'openai',
    name: 'OpenAI TTS',
    requiresApiKey: true,
    defaultBaseUrl: 'https://api.openai.com/v1',
    voices: [
      { id: 'alloy', name: 'Alloy', language: 'multi', gender: 'female' },
      { id: 'echo', name: 'Echo', language: 'multi', gender: 'male' },
      { id: 'fable', name: 'Fable', language: 'multi', gender: 'male' },
      { id: 'onyx', name: 'Onyx', language: 'multi', gender: 'male' },
      { id: 'nova', name: 'Nova', language: 'multi', gender: 'female' },
      { id: 'shimmer', name: 'Shimmer', language: 'multi', gender: 'female' },
    ],
    supportedFormats: ['mp3', 'wav', 'ogg'],
    speedRange: { min: 0.25, max: 4.0, default: 1.0 },
  },
  'browser-native': {
    id: 'browser-native',
    name: 'Browser Native (Free)',
    requiresApiKey: false,
    voices: [], // Populated dynamically from SpeechSynthesis API
    supportedFormats: ['mp3'], // Not applicable - streaming
    speedRange: { min: 0.5, max: 2.0, default: 1.0 },
  },
};

export const DEFAULT_TTS_CONFIG = {
  providerId: 'edge-tts' as const,
  voiceId: 'id-ID-GadisNeural',
  speed: 1.0,
  enabled: true,
};

/**
 * Get browser-native voices (must be called after speechSynthesis is ready)
 */
export function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}
