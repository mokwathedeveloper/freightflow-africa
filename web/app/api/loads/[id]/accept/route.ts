import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { sendSMS } from '@/lib/services/sms.service';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, 'TRANSPORTER');
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const transporterId = auth.user.userId;

  // Atomic: only update if still POSTED — prevents double-accept race condition
  const result = await prisma.load.updateMany({
    where: { id, tenantId: auth.user.tenantId, status: 'POSTED' },
    data: { transporterId, status: 'ACCEPTED', acceptedAt: new Date() },
  });

  if (result.count === 0) {
    return NextResponse.json({ success: false, error: 'Load is no longer available' }, { status: 409 });
  }

  await prisma.loadStatusLog.create({
    data: { loadId: id, status: 'ACCEPTED', changedBy: transporterId, channel: 'WEB' },
  });

  const updated = await prisma.load.findUnique({
    where: { id },
    include: {
      shipper: { select: { phone: true } },
      transporter: { select: { name: true } },
    },
  });

  if (!updated) {
    return NextResponse.json({ success: false, error: 'Load not found after update' }, { status: 500 });
  }

  await sendSMS(
    updated.shipper.phone,
    'LOAD_ACCEPTED',
    {
      loadShortId: updated.shortId,
      origin: updated.origin,
      destination: updated.destination,
      transporterName: updated.transporter?.name || '',
      trackUrl: `${APP_URL}/dashboard/shipper/track/${id}`,
    },
    id
  );

  return NextResponse.json({ success: true, data: updated });
}
