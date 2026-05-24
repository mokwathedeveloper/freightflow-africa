import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { userId, role, tenantId } = auth.user;

  if (role !== 'SHIPPER' && role !== 'TRANSPORTER') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));

  const loads = await prisma.load.findMany({
    where: {
      tenantId,
      ...(role === 'SHIPPER' ? { shipperId: userId } : { transporterId: userId }),
    },
    take: limit,
    include: {
      shipper: { select: { name: true, phone: true } },
      transporter: { select: { name: true, phone: true, vehicleType: true, numberPlate: true, rating: true } },
      statusLogs: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: { loads, total: loads.length } });
}
