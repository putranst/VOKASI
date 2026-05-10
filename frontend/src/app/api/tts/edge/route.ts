/**
 * Edge TTS API Route (Free Microsoft TTS)
 * 
 * POST /api/tts/edge
 * Body: { ssml: string, voiceId: string }
 * Returns: Audio blob (MP3)
 */

import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

const EDGE_TTS_ENDPOINT = 'https://speech.platform.bing.com/synthesize';

export async function POST(req: NextRequest) {
  try {
    const { ssml, voiceId } = await req.json();

    if (!ssml) {
      return NextResponse.json({ error: 'SSML is required' }, { status: 400 });
    }

    // Extract language from voice ID (e.g., "id-ID-GadisNeural" → "id-ID")
    const langMatch = voiceId?.match(/^([a-z]{2}-[A-Z]{2})/);
    const lang = langMatch ? langMatch[1] : 'en-US';

    // Build Edge TTS request
    const voiceName = voiceId || 'en-US-GuyNeural';
    const [voiceLang, voiceGender] = [lang, 'Female'];

    const requestSsml = ssml || `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">
      <voice name="${voiceName}" xml:lang="${lang}" xml:gender="${voiceGender}">
        ${ssml}
      </voice>
    </speak>`;

    // Call Microsoft Edge TTS
    const response = await fetch(EDGE_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'VOKASI2-TTS/1.0',
      },
      body: requestSsml,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Edge TTS error:', errorText);
      return NextResponse.json(
        { error: 'TTS generation failed', details: errorText },
        { status: response.status }
      );
    }

    // Return the audio blob
    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Edge TTS error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
