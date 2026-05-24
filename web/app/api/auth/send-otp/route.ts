import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendPhoneOTP } from '@/lib/services/otp.service';

const phoneSchema = z.string().regex(/^\+\d{7,15}$/, 'Invalid phone number format');
const SUCCESS_MSG = 'Verification code sent if this number is registered.';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = phoneSchema.safeParse(body?.phone);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
    }
    const phone = parsed.data;

    const user = await prisma.user.findUnique({ where: { phone } });
    // Do not reveal whether the phone exists — silently skip if not found
    if (user) await sendPhoneOTP(user.id, phone);

    return NextResponse.json({ success: true, message: SUCCESS_MSG });
  } catch (err) {
    console.error('[send-otp]', err);
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 });
  }
}
