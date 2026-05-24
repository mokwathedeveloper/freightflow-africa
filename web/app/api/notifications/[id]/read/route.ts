import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { id } = await params;

  await prisma.notification.updateMany({
    where: { id, userId: auth.user.userId },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true, message: 'Notification marked as read' });
}
