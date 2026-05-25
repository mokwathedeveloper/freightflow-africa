import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOTP } from '@/lib/services/otp.service';
import { hashPassword } from '@/lib/hash';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, newPassword } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ success: false, error: 'Missing phone or code' }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const isValid = await verifyOTP(phone, otp);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { phone }, data: { passwordHash } });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch {
    return NextResponse.json({ success: false, error: 'Password reset failed' }, { status: 500 });
  }
}
