import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const DEFAULTS = {
  defaultOrigin: '',
  currency:      'KES',
  weightUnit:    'tonnes',
};

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const user = await prisma.user.findUnique({
    where:  { id: auth.user.userId },
    select: { userPrefs: true },
  });

  return NextResponse.json({ success: true, data: user?.userPrefs ?? DEFAULTS });
}

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const prefs = await req.json();

  await prisma.user.update({
    where: { id: auth.user.userId },
    data:  { userPrefs: prefs },
  });

  return NextResponse.json({ success: true, message: 'Preferences saved' });
}
