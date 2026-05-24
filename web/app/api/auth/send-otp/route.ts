import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPhoneOTP } from '@/lib/services/otp.service';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Phone number not found' }, { status: 404 });
    }

    await sendPhoneOTP(user.id, phone);
    return NextResponse.json({ success: true, message: 'Verification code sent to your phone' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}
