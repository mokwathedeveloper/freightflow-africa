import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { disputeSchema } from '@/lib/validators';
import { ZodError } from 'zod';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, 'SHIPPER');
  if ('error' in auth) return auth.error;

  const { id } = await params;

  try {
    const { description } = disputeSchema.parse(await req.json());

    const load = await prisma.load.findFirst({
      where: { id, shipperId: auth.user.userId, tenantId: auth.user.tenantId },
    });

    if (!load) {
      return NextResponse.json({ success: false, error: 'Load not found' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.load.update({ where: { id }, data: { status: 'DISPUTED' } }),
      prisma.loadStatusLog.create({
        data: { loadId: id, status: 'DISPUTED', changedBy: auth.user.userId, channel: 'WEB' },
      }),
      prisma.dispute.create({
        data: { tenantId: auth.user.tenantId, loadId: id, raisedById: auth.user.userId, description },
      }),
    ]);

    return NextResponse.json({ success: true, message: 'Dispute raised. Our team will review shortly.' });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to raise dispute' }, { status: 500 });
  }
}
