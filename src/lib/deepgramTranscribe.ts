/**
 * Server-only: transcribe audio/video with Deepgram pre-recorded API.
 * @see https://developers.deepgram.com/reference/pre-recorded
 */

const DEEPGRAM_LISTEN_URL = 'https://api.deepgram.com/v1/listen';

export type DeepgramTranscribeResult = {
  transcript: string | null;
  /** Present when Deepgram is skipped or fails; upload should still succeed */
  skipped?: boolean;
  error?: string;
};

export async function transcribeMediaWithDeepgram(
  buffer: Buffer,
  mimeType: string
): Promise<DeepgramTranscribeResult> {
  const apiKey = process.env.DEEPGRAM_API_KEY?.trim();
  if (!apiKey) {
    return { transcript: null, skipped: true };
  }

  const params = new URLSearchParams({
    model: 'nova-2',
    smart_format: 'true',
    punctuate: 'true',
  });

  try {
    const res = await fetch(`${DEEPGRAM_LISTEN_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': mimeType || 'application/octet-stream',
      },
      body: new Uint8Array(buffer),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error('[Deepgram]', res.status, raw.slice(0, 500));
      return { transcript: null, error: `Deepgram HTTP ${res.status}` };
    }

    let data: {
      results?: {
        channels?: Array<{
          alternatives?: Array<{ transcript?: string }>;
        }>;
      };
    };
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      return { transcript: null, error: 'Invalid Deepgram response' };
    }

    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? '';
    return { transcript: transcript || null };
  } catch (e) {
    console.error('[Deepgram] request failed', e);
    return {
      transcript: null,
      error: e instanceof Error ? e.message : 'Deepgram request failed',
    };
  }
}
