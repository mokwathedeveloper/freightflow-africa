import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id: atMessageId, status } = body;

  if (atMessageId) {
    await prisma.smsLog.updateMany({
      where: { atMessageId },
      data: { status: status === 'Success' ? 'DELIVERED' : 'FAILED' },
    });
  }

  return NextResponse.json({ received: true });
}
