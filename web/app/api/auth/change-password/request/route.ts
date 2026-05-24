import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendPhoneOTP } from '@/lib/services/otp.service';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('error' in auth) return auth.error;

    const user = await prisma.user.findUnique({ where: { id: auth.user.userId }, select: { id: true, phone: true } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    await sendPhoneOTP(user.id, user.phone);
    return NextResponse.json({ success: true, message: 'Verification code sent to your phone' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to send code' }, { status: 500 });
  }
}
