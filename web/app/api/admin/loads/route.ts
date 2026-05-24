import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import type { LoadStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const auth = requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

    const loads = await prisma.load.findMany({
      where: {
        tenantId: auth.user.tenantId,
        ...(status && status !== 'ALL' && { status: status as LoadStatus }),
      },
      include: {
        shipper:     { select: { name: true, company: true } },
        transporter: { select: { name: true, vehicleType: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, data: { loads, total: loads.length } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch loads' }, { status: 500 });
  }
}
