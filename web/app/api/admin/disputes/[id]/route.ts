import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireRole(req, 'ADMIN');
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const { resolution, finalStatus } = await req.json();

  await prisma.dispute.update({
    where: { id },
    data: { status: 'RESOLVED', resolution, resolvedById: auth.user.userId },
  });

  if (finalStatus) {
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (dispute) {
      await prisma.load.update({ where: { id: dispute.loadId }, data: { status: finalStatus } });
    }
  }

  return NextResponse.json({ success: true, message: 'Dispute resolved' });
}
