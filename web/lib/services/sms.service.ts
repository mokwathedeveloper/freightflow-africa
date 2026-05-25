import { sms } from './at';
import { prisma } from '../prisma';

const SENDER = process.env.AT_SENDER_ID || 'FreightFlow';

type SMSEvent =
  | 'LOAD_POSTED' | 'LOAD_ACCEPTED' | 'CARGO_PICKUP' | 'IN_TRANSIT_UPDATE'
  | 'DELIVERY_REPORTED' | 'DELIVERY_CONFIRMED' | 'CARGO_DELAYED'
  | 'OTP_VERIFICATION' | 'DISPUTE_RAISED' | 'DISPUTE_RESOLVED';

interface Params {
  loadShortId?: string; transporterName?: string; origin?: string;
  destination?: string; checkpoint?: string; otp?: string; trackUrl?: string;
}

const templates: Record<SMSEvent, (p: Params) => string> = {
  LOAD_POSTED:         (p) => `FreightFlow: New load ${p.origin}→${p.destination}. Open app to accept.`,
  LOAD_ACCEPTED:       (p) => `FreightFlow: Load #${p.loadShortId} accepted by ${p.transporterName}. Track: ${p.trackUrl}`,
  CARGO_PICKUP:        (p) => `FreightFlow: Cargo #${p.loadShortId} picked up by ${p.transporterName}.`,
  IN_TRANSIT_UPDATE:   (p) => `FreightFlow: Cargo #${p.loadShortId} in transit. Checkpoint: ${p.checkpoint}.`,
  DELIVERY_REPORTED:   (p) => `FreightFlow: Driver reports delivery of #${p.loadShortId}. Confirm in app within 48h.`,
  DELIVERY_CONFIRMED:  (p) => `FreightFlow: Cargo #${p.loadShortId} confirmed delivered. Thank you!`,
  CARGO_DELAYED:       (p) => `FreightFlow: Alert — Cargo #${p.loadShortId} has no update in 3+ hours.`,
  OTP_VERIFICATION:    (p) => `FreightFlow: Your code is ${p.otp}. Valid 10 min. Do not share.`,
  DISPUTE_RAISED:      (p) => `FreightFlow: Dispute raised for #${p.loadShortId}. Team will contact you.`,
  DISPUTE_RESOLVED:    (p) => `FreightFlow: Dispute for #${p.loadShortId} resolved. Check app for details.`,
};

export const sendSMS = async (
  to: string,
  event: SMSEvent,
  params: Params,
  loadId?: string
): Promise<void> => {
  const message = templates[event](params);

  const log = await prisma.smsLog.create({
    data: { loadId: loadId ?? null, recipient: to, message, status: 'QUEUED' },
  });

  try {
    const res = await sms.send({ to: [to], message, from: SENDER });
    const r = res.SMSMessageData?.Recipients?.[0];
    await prisma.smsLog.update({
      where: { id: log.id },
      data: { status: r?.status === 'Success' ? 'SENT' : 'FAILED', atMessageId: r?.messageId },
    });
  } catch (err) {
    console.error('[sms-send]', err);
    await prisma.smsLog.update({
      where: { id: log.id },
      data: { status: 'FAILED', retryCount: { increment: 1 } },
    });
  }
};
