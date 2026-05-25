import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export function GET(req: NextRequest) {
  const auth = requireRole(req, 'ADMIN');
  if ('error' in auth) return auth.error;

  const apiKey  = process.env.AT_API_KEY  ?? '';
  const username = process.env.AT_USERNAME ?? '';

  const atKeySet     = apiKey.length > 0 && apiKey !== 'placeholder';
  const sandboxMode  = username === 'sandbox';

  return NextResponse.json({
    success: true,
    data: { atKeySet, sandboxMode, username: sandboxMode ? 'sandbox' : '(configured)' },
  });
}
