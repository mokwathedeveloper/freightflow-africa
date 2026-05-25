import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendPhoneOTP } from '@/lib/services/otp.service';

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('error' in auth) return auth.error;

    const user = await prisma.user.findUnique({ where: { id: auth.user.userId }, select: { id: true, phone: true } });
    // Authenticated user must exist — treat absence as internal error
    if (!user) return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });

    if (!user.phone) {
      return NextResponse.json({ success: false, error: 'No phone number on account' }, { status: 400 });
    }

    if (process.env.SKIP_OTP === 'true') {
      return NextResponse.json({ success: true, message: 'Dev mode: OTP skipped. Enter any 6-digit code.' });
    }

    await sendPhoneOTP(user.id, user.phone);
    return NextResponse.json({ success: true, message: 'Verification code sent to your phone' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to send code' }, { status: 500 });
  }
}
