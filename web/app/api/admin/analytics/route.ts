import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'ADMIN');
  if ('error' in auth) return auth.error;

  const tenantId = auth.user.tenantId;
  const { searchParams } = new URL(req.url);

  const dateFrom = searchParams.get('dateFrom');
  const dateTo   = searchParams.get('dateTo');
  const userType = searchParams.get('userType'); // 'Shipper' | 'Transporter' | 'Admin' | 'All User Types'

  const dateFilter = dateFrom && dateTo ? {
    createdAt: {
      gte: new Date(dateFrom),
      lte: new Date(`${dateTo}T23:59:59Z`),
    },
  } : {};

  const roleFilter = userType && userType !== 'All User Types'
    ? { role: userType.toUpperCase() as 'SHIPPER' | 'TRANSPORTER' | 'ADMIN' }
    : {};

  try {
    const [totalLoads, delivered, disputed, activeUsers] = await Promise.all([
      prisma.load.count({ where: { tenantId, ...dateFilter } }),
      prisma.load.count({ where: { tenantId, status: 'DELIVERED', ...dateFilter } }),
      prisma.load.count({ where: { tenantId, status: 'DISPUTED', ...dateFilter } }),
      prisma.user.count({ where: { tenantId, isActive: true, ...roleFilter } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalLoads, delivered, disputed, activeUsers,
        deliveryRate: totalLoads ? Math.round((delivered / totalLoads) * 100) : 0,
      },
    });
  } catch (err) {
    console.error('[admin-analytics]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
