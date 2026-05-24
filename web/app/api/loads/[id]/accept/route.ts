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

  const load = await prisma.load.findFirst({
    where: { id, tenantId: auth.user.tenantId, status: 'POSTED' },
  });

  if (!load) {
    return NextResponse.json({ success: false, error: 'Load is no longer available' }, { status: 409 });
  }

  const [updated] = await prisma.$transaction([
    prisma.load.update({
      where: { id },
      data: { transporterId, status: 'ACCEPTED', acceptedAt: new Date() },
      include: {
        shipper: { select: { phone: true } },
        transporter: { select: { name: true } },
      },
    }),
    prisma.loadStatusLog.create({
      data: { loadId: id, status: 'ACCEPTED', changedBy: transporterId, channel: 'WEB' },
    }),
  ]);

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
