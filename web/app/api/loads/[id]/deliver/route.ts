import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { sendSMS } from '@/lib/services/sms.service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, 'TRANSPORTER');
  if ('error' in auth) return auth.error;

  const { id } = await params;

  const load = await prisma.load.findFirst({
    where: { id, transporterId: auth.user.userId, tenantId: auth.user.tenantId },
    include: { shipper: { select: { phone: true } } },
  });

  if (!load) {
    return NextResponse.json({ success: false, error: 'Load not found' }, { status: 404 });
  }

  await prisma.load.update({
    where: { id },
    data: { status: 'AWAITING_CONFIRMATION', deliveredAt: new Date() },
  });

  await prisma.loadStatusLog.create({
    data: { loadId: id, status: 'AWAITING_CONFIRMATION', changedBy: auth.user.userId, channel: 'WEB' },
  });

  await sendSMS(load.shipper.phone, 'DELIVERY_REPORTED', { loadShortId: load.shortId }, id);

  return NextResponse.json({ success: true, message: 'Delivery reported. Awaiting shipper confirmation.' });
}
