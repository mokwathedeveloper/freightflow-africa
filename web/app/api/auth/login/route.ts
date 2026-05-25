import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/hash';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { ZodError, z } from 'zod';

// Normalise phone: accepts 07XXXXXXXX, 254XXXXXXXXX, +254XXXXXXXXX → +254XXXXXXXXX
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\s/g, '');
  if (digits.startsWith('+254')) return digits;
  if (digits.startsWith('254'))  return `+${digits}`;
  if (digits.startsWith('0'))    return `+254${digits.slice(1)}`;
  return digits;
}

const loginSchema = z.object({
  phone:    z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

// Pre-computed bcrypt hash of '__dummy__' (cost 10) — comparePassword always runs to prevent
// timing-based user enumeration. Pre-computed so no sync bcrypt at module load time.
const DUMMY_HASH = '$2b$10$gQavec90z44ff6bqsojIK.aku0TpmHY5oeXTJJK7aljSbKNDabv7G';

export async function POST(req: NextRequest) {
  try {
    const body = loginSchema.parse(await req.json());
    const phone = normalizePhone(body.phone);
    const { password } = body;

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
    console.error('[login]', err);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
