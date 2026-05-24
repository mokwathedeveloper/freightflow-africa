import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPhoneOTP } from '@/lib/services/otp.service';

const SUCCESS_MSG = 'If this number is registered, a code has been sent.';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const user = await prisma.user.findUnique({ where: { phone } });

    // Always return 200 — never reveal whether a phone number is registered
    if (user) await sendPhoneOTP(user.id, phone);

    return NextResponse.json({ success: true, message: SUCCESS_MSG });
  } catch {
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
  }
}
