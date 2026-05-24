import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { comparePassword, hashPassword } from '@/lib/hash';
import { sendPhoneOTP, verifyOTP } from '@/lib/services/otp.service';

// POST /api/auth/change-password/request  — send OTP to user's phone
// POST /api/auth/change-password/confirm  — verify OTP + change password

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const url = new URL(req.url);
  const action = url.searchParams.get('action') ?? url.pathname.split('/').pop();

  const user = await prisma.user.findUnique({ where: { id: auth.user.userId } });
  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  // Request: send OTP
  if (action === 'request' || url.pathname.endsWith('/request')) {
    await sendPhoneOTP(user.id, user.phone);
    return NextResponse.json({ success: true, message: 'OTP sent to your registered phone number' });
  }

  // Confirm: verify OTP + update password
  const { currentPassword, newPassword, otp } = await req.json();

  if (!currentPassword || !newPassword || !otp) {
    return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const passwordOk = await comparePassword(currentPassword, user.passwordHash);
  if (!passwordOk) {
    return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
  }

  const otpOk = await verifyOTP(user.phone, otp);
  if (!otpOk) {
    return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ success: true, message: 'Password changed successfully' });
}
