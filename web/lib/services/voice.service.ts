import { voice } from './at';

const FROM    = process.env.AT_VOICE_NUMBER || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SECRET  = process.env.AT_WEBHOOK_SECRET || '';

export async function makeVoiceCall(to: string): Promise<void> {
  if (!FROM) {
    console.warn('[Voice] AT_VOICE_NUMBER not configured — skipping voice call');
    return;
  }

  // AT fetches SSML content from the webhook callback URL when the call connects
  const callbackUrl = `${APP_URL}/api/webhooks/voice${SECRET ? `?secret=${SECRET}` : ''}`;

  try {
    await (voice.call as Function)({
      callFrom: FROM,
      callTo:   [to],
      url:      callbackUrl,
    });
    console.log(`[Voice] Call initiated to ${to}`);
  } catch (err) {
    // Non-blocking — voice call failure does not block the primary action
    console.error('[Voice] Call failed:', err);
  }
}
