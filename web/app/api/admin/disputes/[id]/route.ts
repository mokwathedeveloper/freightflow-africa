import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { Prisma } from '@prisma/client';

const ALLOWED_FINAL_STATUSES = new Set(['DELIVERED', 'CANCELLED', 'POSTED']);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, 'ADMIN');
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const { resolution, finalStatus } = await req.json();

  if (finalStatus && !ALLOWED_FINAL_STATUSES.has(finalStatus)) {
    return NextResponse.json({ success: false, error: 'Invalid final status' }, { status: 400 });
  }

  try {
    const existing = await prisma.dispute.findUnique({
      where: { id },
      select: { tenantId: true, loadId: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }
    if (existing.tenantId !== auth.user.tenantId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id },
        data: { status: 'RESOLVED', resolution, resolvedById: auth.user.userId },
      });
      if (finalStatus) {
        await tx.load.update({ where: { id: existing.loadId }, data: { status: finalStatus } });
      }
    });

    logAudit({
      userId: auth.user.userId,
      tenantId: auth.user.tenantId,
      action: 'DISPUTE_RESOLVED',
      resource: 'Dispute',
      resourceId: id,
      metadata: { resolution, finalStatus },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ success: true, message: 'Dispute resolved' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }
    console.error('[admin-disputes-patch]', err);
    return NextResponse.json({ success: false, error: 'Failed to resolve dispute' }, { status: 500 });
  }
}
