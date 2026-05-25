import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const PLAN_TO_TIER: Record<string, 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'> = {
  starter:    'STARTER',
  growth:     'PROFESSIONAL',
  enterprise: 'ENTERPRISE',
};

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if ('error' in auth) return auth.error;

    const { planId } = await req.json();
    const tier = PLAN_TO_TIER[planId];

    if (!tier) {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }

    const now = new Date();
    const nextMonthLastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(now.getDate(), nextMonthLastDay));

    await prisma.subscription.upsert({
      where:  { tenantId: auth.user.tenantId },
      create: { tenantId: auth.user.tenantId, tier, endDate },
      update: { tier, endDate },
    });

    logAudit({
      userId: auth.user.userId,
      tenantId: auth.user.tenantId,
      action: 'SUBSCRIPTION_CHANGED',
      resource: 'Subscription',
      metadata: { planId, tier },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ success: true, message: `Plan updated to ${planId}` });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update plan' }, { status: 500 });
  }
}
