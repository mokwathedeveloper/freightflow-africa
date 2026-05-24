import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
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
    const updated = await prisma.dispute.update({
      where: { id },
      data: { status: 'RESOLVED', resolution, resolvedById: auth.user.userId },
      select: { loadId: true },
    });

    if (finalStatus) {
      await prisma.load.update({ where: { id: updated.loadId }, data: { status: finalStatus } });
    }

    return NextResponse.json({ success: true, message: 'Dispute resolved' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Dispute not found' }, { status: 404 });
    }
    console.error('[admin-disputes-patch]', err);
    return NextResponse.json({ success: false, error: 'Failed to resolve dispute' }, { status: 500 });
  }
}
