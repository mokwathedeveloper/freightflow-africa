import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireRole(req, 'ADMIN');
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const action   = searchParams.get('action')   ?? '';
  const search   = searchParams.get('search')   ?? '';
  const dateFrom = searchParams.get('dateFrom') ?? '';
  const dateTo   = searchParams.get('dateTo')   ?? '';
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit    = 20;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};
  if (action && action !== 'ALL') where.action = action;
  if (search) {
    where.OR = [
      { actorName: { contains: search, mode: 'insensitive' } },
      { resource:  { contains: search, mode: 'insensitive' } },
      { action:    { contains: search, mode: 'insensitive' } },
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo   ? { lte: new Date(dateTo + 'T23:59:59Z') } : {}),
    };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { logs, total, page, limit } });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireRole(req, 'ADMIN');
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: 401 });

  await prisma.auditLog.deleteMany({});
  return NextResponse.json({ success: true });
}
