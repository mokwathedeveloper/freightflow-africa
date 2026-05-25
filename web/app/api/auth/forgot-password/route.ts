import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendPhoneOTP } from '@/lib/services/otp.service';

const SUCCESS_MSG = 'If this number is registered, a code has been sent.';
const phoneSchema = z.string().regex(/^\+\d{7,15}$/, 'Invalid phone number format');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = phoneSchema.safeParse(body?.phone);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid phone number format' }, { status: 400 });
    }
    const phone = parsed.data;

    const user = await prisma.user.findUnique({ where: { phone } });

    // Always return 200 — never reveal whether a phone number is registered
    if (user) await sendPhoneOTP(user.id, phone);

    return NextResponse.json({ success: true, message: SUCCESS_MSG });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
  }
}
