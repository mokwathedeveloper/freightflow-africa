import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { id } = await params;

  const load = await prisma.load.findFirst({
    where: { id, tenantId: auth.user.tenantId },
    include: {
      shipper: { select: { name: true, phone: true, company: true } },
      transporter: { select: { name: true, phone: true, vehicleType: true, numberPlate: true, rating: true } },
      statusLogs: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!load) {
    return NextResponse.json({ success: false, error: 'Load not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: load });
}
