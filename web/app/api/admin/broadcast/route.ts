import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { sms } from '@/lib/services/at';

export async function POST(req: NextRequest) {
  try {
    const auth = requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { message, role } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const where = role && role !== 'ALL'
      ? { tenantId: auth.user.tenantId, role, isActive: true }
      : { tenantId: auth.user.tenantId, isActive: true };

    const users = await prisma.user.findMany({ where, select: { phone: true } });
    const phones = users.map((u) => u.phone);

    if (phones.length > 0) {
      await sms.send({ to: phones, message });
    }

    logAudit({
      userId: auth.user.userId,
      tenantId: auth.user.tenantId,
      action: 'BROADCAST_SENT',
      resource: 'Broadcast',
      metadata: { role: role ?? 'ALL', recipientCount: users.length, messageLength: message.trim().length },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch (err) {
    console.error('[broadcast] Broadcast failed', err);
    return NextResponse.json({ success: false, error: 'Broadcast failed' }, { status: 500 });
  }
}
