import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const WEBHOOK_SECRET = process.env.AT_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  // Verify shared secret passed as ?secret= query param
  if (WEBHOOK_SECRET) {
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const atMessageId = typeof body.id === 'string' && body.id.trim() ? body.id.trim() : null;
  const status = typeof body.status === 'string' ? body.status : '';

  if (atMessageId) {
    await prisma.smsLog.updateMany({
      where: { atMessageId },
      data: { status: status === 'Success' ? 'DELIVERED' : 'FAILED' },
    });
  }

  return NextResponse.json({ received: true });
}
