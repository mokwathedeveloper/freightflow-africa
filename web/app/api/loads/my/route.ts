import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { userId, role, tenantId } = auth.user;

  const loads = await prisma.load.findMany({
    where: {
      tenantId,
      ...(role === 'SHIPPER' ? { shipperId: userId } : { transporterId: userId }),
    },
    include: {
      shipper: { select: { name: true, phone: true } },
      transporter: { select: { name: true, phone: true, vehicleType: true, numberPlate: true, rating: true } },
      statusLogs: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: { loads, total: loads.length } });
}
