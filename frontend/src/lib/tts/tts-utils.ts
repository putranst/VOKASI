/**
 * TTS Provider Utilities for VOKASI2
 * 
 * Handles text-to-speech generation across multiple providers.
 */

import type { TTSRequest, TTSResponse, TTSProviderId } from './types';
import { TTS_PROVIDERS } from './constants';

/**
 * Generate TTS using Edge TTS (Microsoft - Free)
 */
async function generateEdgeTTS(text: string, voiceId: string, speed: number): Promise<string> {
  // Edge TTS uses SSML for voice and rate control
  const rate = Math.round((speed - 1) * 100); // Convert 1.0 → 0%, 1.5 → +50%
  const rateStr = rate >= 0 ? `+${rate}%` : `${rate}%`;
  
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voiceId.split('-').slice(0, 2).join('-')}">
    <voice name="${voiceId}">
      <prosody rate="${rateStr}">${escapeXml(text)}</prosody>
    </voice>
  </speak>`;

  // Use the free Edge TTS endpoint
  const response = await fetch('/api/tts/edge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ssml, voiceId }),
  });

  if (!response.ok) {
    throw new Error(`Edge TTS failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Generate TTS using OpenAI API
 */
async function generateOpenAITTS(text: string, voiceId: string, speed: number): Promise<string> {
  const response = await fetch('/api/tts/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: voiceId, speed }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI TTS failed: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Generate TTS using Browser Native Speech Synthesis
 */
function generateBrowserTTS(text: string, voiceId: string, speed: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Browser speech synthesis not available'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find the voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === voiceId || v.voiceURI === voiceId);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = speed;
    utterance.onend = () => resolve(''); // No URL for browser TTS
    utterance.onerror = (e) => reject(new Error(`Browser TTS error: ${e.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Main TTS generation function
 */
export async function generateTTS(request: TTSRequest): Promise<string> {
  const { text, providerId, voiceId, speed = 1.0 } = request;

  if (!text || text.trim().length === 0) {
    throw new Error('Text is required for TTS');
  }

  // Truncate very long text (TTS limits)
  const truncatedText = text.length > 5000 ? text.slice(0, 5000) + '...' : text;

  switch (providerId) {
    case 'edge-tts':
      return generateEdgeTTS(truncatedText, voiceId, speed);
    case 'openai':
      return generateOpenAITTS(truncatedText, voiceId, speed);
    case 'browser-native':
      return generateBrowserTTS(truncatedText, voiceId, speed);
    default:
      throw new Error(`Unsupported TTS provider: ${providerId}`);
  }
}

/**
 * Get available voices for a provider
 */
export function getVoicesForProvider(providerId: TTSProviderId): Array<{ id: string; name: string; language: string; gender: string }> {
  const provider = TTS_PROVIDERS[providerId];
  if (!provider) return [];
  return provider.voices;
}

/**
 * Estimate audio duration (rough: 150 words/minute)
 */
export function estimateDuration(text: string, speed: number = 1.0): number {
  const words = text.split(/\s+/).length;
  const minutes = words / (150 * speed);
  return Math.round(minutes * 60);
}

/**
 * Escape XML special characters for SSML
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
