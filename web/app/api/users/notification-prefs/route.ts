import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const DEFAULTS = {
  smsOnAccepted:  true,
  smsOnPickedUp:  true,
  smsOnDelivered: true,
  smsOnDispute:   true,
  emailDigest:    false,
};

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const user = await prisma.user.findUnique({
    where:  { id: auth.user.userId },
    select: { notifPrefs: true },
  });

  return NextResponse.json({ success: true, data: user?.notifPrefs ?? DEFAULTS });
}

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const prefs = await req.json();

  await prisma.user.update({
    where: { id: auth.user.userId },
    data:  { notifPrefs: prefs },
  });

  return NextResponse.json({ success: true, message: 'Notification preferences saved' });
}
