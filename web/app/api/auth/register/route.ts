import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/hash';
import { sendPhoneOTP } from '@/lib/services/otp.service';
import { registerSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Phone number already registered' }, { status: 409 });
    }

    // Get or create default tenant
    let tenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
    if (!tenant) {
      tenant = await prisma.tenant.create({ data: { name: 'FreightFlow', slug: 'default' } });
    }

    const passwordHash = await hashPassword(body.password);

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
      },
    });

    await sendPhoneOTP(user.id, user.phone);

    return NextResponse.json(
      { success: true, message: 'Registration successful. Check your phone for a verification code.', data: { userId: user.id } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 });
  }
}
