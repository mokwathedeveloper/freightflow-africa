import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { sendSMS } from '@/lib/services/sms.service';
import { updateStatusSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, 'TRANSPORTER');
  if ('error' in auth) return auth.error;

  const { id } = await params;

  try {
    const { status, note } = updateStatusSchema.parse(await req.json());

    const load = await prisma.load.findFirst({
      where: { id, transporterId: auth.user.userId, tenantId: auth.user.tenantId },
      include: {
        shipper: { select: { phone: true } },
        transporter: { select: { name: true } },
      },
    });

    if (!load) {
      return NextResponse.json({ success: false, error: 'Load not found' }, { status: 404 });
    }

    const timestamps: Record<string, object> = {
      PICKED_UP: { pickedUpAt: new Date() },
      IN_TRANSIT: { inTransitAt: new Date() },
    };

    await prisma.load.update({
      where: { id },
      data: { status, lastLocation: note, ...timestamps[status] },
    });

    await prisma.loadStatusLog.create({
      data: { loadId: id, status, changedBy: auth.user.userId, channel: 'WEB', note },
    });

    logAudit({
      userId: auth.user.userId,
      tenantId: auth.user.tenantId,
      action: 'LOAD_STATUS_CHANGED',
      resource: 'Load',
      resourceId: id,
      metadata: { status, shortId: load.shortId },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    const eventMap: Record<string, 'CARGO_PICKUP' | 'IN_TRANSIT_UPDATE'> = {
      PICKED_UP: 'CARGO_PICKUP',
      IN_TRANSIT: 'IN_TRANSIT_UPDATE',
    };
    const event = eventMap[status] ?? 'IN_TRANSIT_UPDATE';
    sendSMS(load.shipper.phone, event, {
      loadShortId: load.shortId,
      transporterName: load.transporter?.name || '',
      checkpoint: note || load.destination,
    }, id).catch((err) => console.error('[status-sms]', err));

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
