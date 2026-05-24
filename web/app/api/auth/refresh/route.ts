import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ success: false, error: 'Refresh token required' }, { status: 401 });
    }

    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({
      userId: payload.userId,
      role: payload.role,
      tenantId: payload.tenantId,
    });

    return NextResponse.json({ success: true, data: { accessToken } });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid refresh token' }, { status: 401 });
  }
}
