import { randomInt } from 'crypto';
import { prisma } from '../prisma';
import { hashOTP, compareOTP } from '../hash';
import { sendSMS } from './sms.service';

const OTP_EXPIRY_MINUTES = 10;

export const generateOTP = (): string =>
  randomInt(100000, 1000000).toString();

export const sendPhoneOTP = async (userId: string, phone: string): Promise<void> => {
  await prisma.otpRecord.updateMany({ where: { phone, used: false }, data: { used: true } });

  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Create record first, then attempt SMS. If SMS fails, delete the record so no phantom OTP lingers.
  const record = await prisma.otpRecord.create({ data: { userId, phone, otpHash, expiresAt } });
  try {
    await sendSMS(phone, 'OTP_VERIFICATION', { otp });
  } catch (err) {
    await prisma.otpRecord.delete({ where: { id: record.id } }).catch(() => {});
    throw err;
  }
};

export const verifyOTP = async (phone: string, inputOtp: string): Promise<boolean> => {
  const record = await prisma.otpRecord.findFirst({
    where: { phone, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return false;

  const isMatch = await compareOTP(inputOtp, record.otpHash);
  if (isMatch) {
    await prisma.otpRecord.update({ where: { id: record.id }, data: { used: true } });
  }

  return isMatch;
};
