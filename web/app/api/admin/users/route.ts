import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'ADMIN');
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const skip  = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId: auth.user.tenantId },
      select: { id: true, name: true, phone: true, role: true, isVerified: true, isActive: true, rating: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.user.count({ where: { tenantId: auth.user.tenantId } }),
  ]);

  return NextResponse.json({ success: true, data: { users, total, page, limit } });
}
