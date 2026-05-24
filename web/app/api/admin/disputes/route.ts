import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const disputes = await prisma.dispute.findMany({
      where: { tenantId: auth.user.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        raisedBy: { select: { name: true, phone: true } },
        load:     { select: { shortId: true, origin: true, destination: true } },
      },
    });

    return NextResponse.json({ success: true, data: disputes });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch disputes' }, { status: 500 });
  }
}
