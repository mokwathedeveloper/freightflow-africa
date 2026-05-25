import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { sendSMS } from '@/lib/services/sms.service';
import { disburseAirtimeReward } from '@/lib/services/airtime.service';
import { confirmDeliverySchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, 'SHIPPER');
  if ('error' in auth) return auth.error;

  const { id } = await params;

  try {
    const { rating, ratingNote } = confirmDeliverySchema.parse(await req.json());

    const load = await prisma.load.findFirst({
      where: { id, shipperId: auth.user.userId, tenantId: auth.user.tenantId, status: 'AWAITING_CONFIRMATION' },
      include: {
        transporter: { select: { id: true, phone: true, rating: true, ratingCount: true } },
        shipper: { select: { phone: true } },
      },
    });

    if (!load) {
      return NextResponse.json({ success: false, error: 'Load not found or not awaiting confirmation' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.load.update({
        where: { id },
        data: { status: 'DELIVERED', confirmedAt: new Date(), rating, ratingNote },
      });
      await tx.loadStatusLog.create({
        data: { loadId: id, status: 'DELIVERED', changedBy: auth.user.userId, channel: 'WEB' },
      });
      if (load.transporter) {
        const newCount = load.transporter.ratingCount + 1;
        const newRating = (load.transporter.rating * load.transporter.ratingCount + rating) / newCount;
        await tx.user.update({
          where: { id: load.transporter.id },
          data: { rating: newRating, ratingCount: newCount },
        });
      }
    });

    const smsTasks: Promise<unknown>[] = [
      sendSMS(load.shipper.phone, 'DELIVERY_CONFIRMED', { loadShortId: load.shortId }, id),
    ];
    if (load.transporter) {
      smsTasks.push(sendSMS(load.transporter.phone, 'DELIVERY_CONFIRMED', { loadShortId: load.shortId }, id));
      if (rating >= 4) {
        disburseAirtimeReward(load.transporter.id, load.transporter.phone, id)
          .catch((err) => console.error('[confirm-airtime]', err));
      }
    }
    Promise.allSettled(smsTasks).catch((err) => console.error('[confirm-sms]', err));

    return NextResponse.json({ success: true, message: 'Delivery confirmed successfully' });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Confirmation failed' }, { status: 500 });
  }
}
