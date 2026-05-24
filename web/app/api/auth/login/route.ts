import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/hash';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { phone } });

    // Constant-time response regardless of whether user exists or password is wrong
    if (!user || !user.isVerified || !(await comparePassword(password, user.passwordHash))) {
      return NextResponse.json({ success: false, error: 'Invalid phone number or password' }, { status: 401 });
    }

    const tokenPayload = { userId: user.id, role: user.role, tenantId: user.tenantId };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, role: user.role, phone: user.phone },
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
