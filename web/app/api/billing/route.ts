import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const TIER_META: Record<string, { id: string; name: string; price: number }> = {
  FREE:         { id: 'starter',    name: 'Starter',    price: 0 },
  STARTER:      { id: 'starter',    name: 'Starter',    price: 0 },
  PROFESSIONAL: { id: 'growth',     name: 'Growth',     price: 2500 },
  ENTERPRISE:   { id: 'enterprise', name: 'Enterprise', price: 8000 },
};

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('error' in auth) return auth.error;

    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: auth.user.tenantId },
    });

    const tier = subscription?.tier ?? 'FREE';
    const meta = TIER_META[tier] ?? TIER_META.FREE;

    return NextResponse.json({
      success: true,
      data: {
        currentPlan: {
          id: meta.id,
          name: meta.name,
          price: meta.price,
          currency: 'KES',
          interval: 'month',
          features: [],
          isCurrent: true,
        },
        nextBillingDate: subscription?.endDate ?? null,
        paymentMethod: null,
        history: [],
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch billing info' }, { status: 500 });
  }
}
