import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/hash';
import { sendPhoneOTP } from '@/lib/services/otp.service';
import { registerSchema } from '@/lib/validators';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Phone number already registered' }, { status: 409 });
    }

    const tenant = await prisma.tenant.upsert({
      where: { slug: 'default' },
      update: {},
      create: { name: 'FreightFlow', slug: 'default' },
    });

    const passwordHash = await hashPassword(body.password);

    const skipOtp = process.env.SKIP_OTP === 'true';

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        phone: body.phone,
        name: body.name,
        passwordHash,
        role: body.role,
        company: body.company,
        vehicleType: body.vehicleType,
        numberPlate: body.numberPlate,
        isVerified: skipOtp,
      },
    });

    if (!skipOtp) {
      await sendPhoneOTP(user.id, user.phone);
    }

    const message = skipOtp
      ? 'Registration successful. You can now log in.'
      : 'Registration successful. Check your phone for a verification code.';

    return NextResponse.json(
      { success: true, message, skipOtp, data: { userId: user.id } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Phone number already registered' }, { status: 409 });
    }
    console.error('[register]', err);
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
