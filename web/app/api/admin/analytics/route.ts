import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'ADMIN');
  if ('error' in auth) return auth.error;

  const tenantId = auth.user.tenantId;

  try {
    const [totalLoads, delivered, disputed, activeUsers] = await Promise.all([
      prisma.load.count({ where: { tenantId } }),
      prisma.load.count({ where: { tenantId, status: 'DELIVERED' } }),
      prisma.load.count({ where: { tenantId, status: 'DISPUTED' } }),
      prisma.user.count({ where: { tenantId, isActive: true } }),
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
