import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOTP } from '@/lib/services/otp.service';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { otpSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = otpSchema.parse(await req.json());

    const isValid = await verifyOTP(phone, otp);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid or expired code' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { phone },
      data: { isVerified: true },
      select: { id: true, name: true, role: true, tenantId: true, phone: true },
    });

    const tokenPayload = { userId: user.id, role: user.role, tenantId: user.tenantId };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return NextResponse.json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role, phone: user.phone } },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
