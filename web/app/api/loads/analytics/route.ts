import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { userId, role } = auth.user;
  const isShipper = role === 'SHIPPER';
  const whereBase = isShipper ? { shipperId: userId } : { transporterId: userId };
  const now = new Date();

  // Build last-6-month date buckets
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const d    = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    return { label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }), from, to };
  });

  try {
    const [statusGroups, ratingRow] = await Promise.all([
      prisma.load.groupBy({
        by: ['status'],
        where: whereBase,
        _count: { id: true },
      }),
      isShipper
        ? Promise.resolve(null)
        : prisma.user.findUnique({ where: { id: userId }, select: { rating: true, ratingCount: true } }),
    ]);

    const statusMap: Record<string, number> = Object.fromEntries(
      statusGroups.map((g) => [g.status, g._count.id])
    );

    const totalLoads   = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const delivered    = statusMap['DELIVERED']               ?? 0;
    const inTransit    = (statusMap['IN_TRANSIT'] ?? 0) + (statusMap['PICKED_UP'] ?? 0);
    const pending      = (statusMap['POSTED']     ?? 0) + (statusMap['ACCEPTED']  ?? 0);
    const disputed     = statusMap['DISPUTED']               ?? 0;
    const deliveryRate = totalLoads ? Math.round((delivered / totalLoads) * 1000) / 10 : 0;

    // Monthly trend
    const trend = await Promise.all(
      buckets.map(async ({ label, from, to }) => {
        const [total, del] = await Promise.all([
          prisma.load.count({ where: { ...whereBase, createdAt: { gte: from, lte: to } } }),
          prisma.load.count({ where: { ...whereBase, status: 'DELIVERED', createdAt: { gte: from, lte: to } } }),
        ]);
        return { month: label, total, delivered: del };
      })
    );

    // Cargo type breakdown (shipper) or top routes (transporter)
    const [cargoGroups, routeGroups] = await Promise.all([
      isShipper
        ? prisma.load.groupBy({ by: ['cargoType'], where: { shipperId: userId }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 6 })
        : Promise.resolve([]),
      !isShipper
        ? prisma.load.groupBy({ by: ['origin', 'destination'], where: { transporterId: userId }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalLoads,
        delivered,
        inTransit,
        pending,
        disputed,
        deliveryRate,
        trend,
        cargoBreakdown: cargoGroups.map((g) => ({ name: g.cargoType, count: g._count.id })),
        topRoutes:      routeGroups.map((g) => ({ origin: g.origin, destination: g.destination, count: g._count.id })),
        rating:         ratingRow?.rating     ?? 0,
        ratingCount:    ratingRow?.ratingCount ?? 0,
      },
    });
  } catch (err) {
    console.error('[loads-analytics]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
