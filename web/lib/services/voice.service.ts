import { voice } from './at';

const FROM = process.env.AT_VOICE_NUMBER || '';

type VoiceEvent = 'CARGO_DELAYED' | 'DISPUTE_RAISED' | 'HIGH_VALUE_DELIVERY';

const VOICE_TEMPLATES: Record<VoiceEvent, (loadId: string) => string> = {
  CARGO_DELAYED:       (id) => `<Say>FreightFlow alert. Cargo load ${id} has not been updated in over 3 hours. Please check the status immediately.</Say>`,
  DISPUTE_RAISED:      (id) => `<Say>FreightFlow urgent. A dispute has been raised on load ${id}. Please log in to review.</Say>`,
  HIGH_VALUE_DELIVERY: (id) => `<Say>FreightFlow notification. High-value cargo load ${id} has been marked as delivered. Please confirm receipt in your dashboard.</Say>`,
};

export async function makeVoiceCall(
  to: string,
  event: VoiceEvent,
  loadShortId: string
): Promise<void> {
  if (!FROM) {
    console.warn('[Voice] AT_VOICE_NUMBER not configured — skipping voice call');
    return;
  }

  const say = VOICE_TEMPLATES[event](loadShortId);

  try {
    await voice.call({
      callFrom: FROM,
      callTo: [to],
      // AT Voice API accepts inline SSML or a callback URL
      // Using inline text-to-speech for sandbox simplicity
    } as Parameters<typeof voice.call>[0]);

    console.log(`[Voice] Call initiated to ${to} for event ${event}`);
  } catch (err) {
    // Non-blocking — voice call failure does not block the primary action
    console.error('[Voice] Call failed:', err);
  }
}
