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
  const rawLimit = parseInt(searchParams.get('limit') || '');
  const limit = Math.min(200, isNaN(rawLimit) || rawLimit < 1 ? 50 : rawLimit);

  const where = {
    tenantId,
    ...(role === 'SHIPPER' ? { shipperId: userId } : { transporterId: userId }),
  };

  const [loads, total] = await Promise.all([
    prisma.load.findMany({
      where,
      take: limit,
      include: {
        shipper: { select: { name: true, phone: true } },
        transporter: { select: { name: true, phone: true, vehicleType: true, numberPlate: true, rating: true } },
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.load.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { loads, total } });
}
