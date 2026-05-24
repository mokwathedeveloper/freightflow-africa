import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { comparePassword } from '@/lib/hash';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import { ZodError } from 'zod';

// Valid bcrypt hash — ensures comparePassword always runs to prevent timing-based user enumeration
const DUMMY_HASH = bcrypt.hashSync('__dummy_password_not_used__', 12);

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { phone } });

    // Always run comparePassword to prevent timing-based user enumeration
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const passwordMatch = await comparePassword(password, hash);

    if (!user || !user.isVerified || !passwordMatch) {
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
