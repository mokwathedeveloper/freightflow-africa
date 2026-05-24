import { sms } from './at';
import { prisma } from './prisma';
import logger from '../utils/logger';

const SENDER_ID = process.env.AT_SENDER_ID || 'FreightFlow';

type SMSEvent =
  | 'LOAD_POSTED'
  | 'LOAD_ACCEPTED'
  | 'CARGO_PICKUP'
  | 'IN_TRANSIT_UPDATE'
  | 'DELIVERY_REPORTED'
  | 'DELIVERY_CONFIRMED'
  | 'CARGO_DELAYED'
  | 'OTP_VERIFICATION'
  | 'DISPUTE_RAISED'
  | 'DISPUTE_RESOLVED';

interface SMSParams {
  loadShortId?: string;
  transporterName?: string;
  shipperName?: string;
  origin?: string;
  destination?: string;
  checkpoint?: string;
  otp?: string;
  trackUrl?: string;
}

const templates: Record<SMSEvent, (p: SMSParams) => string> = {
  LOAD_POSTED: (p) =>
    `FreightFlow: New load available - ${p.origin} → ${p.destination}. Open app to accept.`,
  LOAD_ACCEPTED: (p) =>
    `FreightFlow: Your load #${p.loadShortId} (${p.origin}→${p.destination}) has been accepted by ${p.transporterName}. Track: ${p.trackUrl}`,
  CARGO_PICKUP: (p) =>
    `FreightFlow: Cargo #${p.loadShortId} has been picked up by ${p.transporterName}. Your goods are on the way.`,
  IN_TRANSIT_UPDATE: (p) =>
    `FreightFlow: Cargo #${p.loadShortId} update - In Transit. Last checkpoint: ${p.checkpoint}.`,
  DELIVERY_REPORTED: (p) =>
    `FreightFlow: Driver reports delivery of cargo #${p.loadShortId}. Please confirm in the app within 48h.`,
  DELIVERY_CONFIRMED: (p) =>
    `FreightFlow: Cargo #${p.loadShortId} delivery confirmed. Thank you for using FreightFlow!`,
  CARGO_DELAYED: (p) =>
    `FreightFlow: Alert - Cargo #${p.loadShortId} has not been updated for 3+ hours. Contact transporter.`,
  OTP_VERIFICATION: (p) =>
    `FreightFlow: Your verification code is ${p.otp}. Valid for 10 minutes. Do not share this code.`,
  DISPUTE_RAISED: (p) =>
    `FreightFlow: A dispute has been raised for cargo #${p.loadShortId}. Our team will review and contact you.`,
  DISPUTE_RESOLVED: (p) =>
    `FreightFlow: Dispute for cargo #${p.loadShortId} has been resolved. Check the app for details.`,
};

export const sendSMS = async (
  to: string,
  event: SMSEvent,
  params: SMSParams,
  loadId?: string
): Promise<void> => {
  const message = templates[event](params);

  const logEntry = await prisma.smsLog.create({
    data: {
      loadId: loadId || null,
      recipient: to,
      message,
      status: 'QUEUED',
    },
  });

  try {
    const response = await sms.send({
      to: [to],
      message,
      from: SENDER_ID,
    });

    const msgData = response.SMSMessageData?.Recipients?.[0];
    await prisma.smsLog.update({
      where: { id: logEntry.id },
      data: {
        status: msgData?.status === 'Success' ? 'SENT' : 'FAILED',
        atMessageId: msgData?.messageId,
      },
    });

    logger.info(`SMS sent to ${to}: ${event}`);
  } catch (err) {
    await prisma.smsLog.update({
      where: { id: logEntry.id },
      data: { status: 'FAILED', retryCount: 1 },
    });
    logger.error(`SMS failed for ${to}: ${event}`, err);
    // Non-blocking — do not throw. Status update already persisted.
  }
};
