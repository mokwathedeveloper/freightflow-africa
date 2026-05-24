import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Preferences are stored client-side; this endpoint validates auth and returns success.
export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  return NextResponse.json({ success: true, message: 'Notification preferences saved' });
}
