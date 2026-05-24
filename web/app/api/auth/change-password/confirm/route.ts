import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { comparePassword, hashPassword } from '@/lib/hash';
import { verifyOTP } from '@/lib/services/otp.service';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('error' in auth) return auth.error;

    const { currentPassword, newPassword, otp } = await req.json();

    if (!currentPassword || !newPassword || !otp) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: auth.user.userId } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

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
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to change password' }, { status: 500 });
  }
}
