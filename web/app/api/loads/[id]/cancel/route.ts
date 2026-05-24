import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, 'SHIPPER');
  if ('error' in auth) return auth.error;

  const { id } = await params;

  const load = await prisma.load.findFirst({
    where: { id, shipperId: auth.user.userId, tenantId: auth.user.tenantId, status: 'POSTED' },
  });

  if (!load) {
    return NextResponse.json({ success: false, error: 'Only POSTED loads can be cancelled' }, { status: 400 });
  }

  await prisma.load.update({ where: { id }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
  await prisma.loadStatusLog.create({
    data: { loadId: id, status: 'CANCELLED', changedBy: auth.user.userId, channel: 'WEB' },
  });

  return NextResponse.json({ success: true, message: 'Load cancelled' });
}
