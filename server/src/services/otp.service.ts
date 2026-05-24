import { prisma } from './prisma';
import { hashOTP, compareOTP } from '../utils/hash';
import { sendSMS } from './sms.service';

const OTP_EXPIRY_MINUTES = 10;

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendPhoneOTP = async (userId: string, phone: string): Promise<void> => {
  // Invalidate any existing unused OTPs for this phone
  await prisma.otpRecord.updateMany({
    where: { phone, used: false },
    data: { used: true },
  });

  const otp = generateOTP();
  const otpHash = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpRecord.create({
    data: { userId, phone, otpHash, expiresAt },
  });

  await sendSMS(phone, 'OTP_VERIFICATION', { otp });
};

export const verifyOTP = async (phone: string, inputOtp: string): Promise<boolean> => {
  const record = await prisma.otpRecord.findFirst({
    where: { phone, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) return false;

  const isMatch = await compareOTP(inputOtp, record.otpHash);

  if (isMatch) {
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { used: true },
    });
  }

  return isMatch;
};
