import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
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

    return NextResponse.json({ success: true, message: `Broadcast sent to ${users.length} users` });
  } catch {
    return NextResponse.json({ success: false, error: 'Broadcast failed' }, { status: 500 });
  }
}
