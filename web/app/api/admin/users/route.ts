import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'ADMIN');
  if ('error' in auth) return auth.error;

  const users = await prisma.user.findMany({
    where: { tenantId: auth.user.tenantId },
    select: { id: true, name: true, phone: true, role: true, isVerified: true, isActive: true, rating: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: users });
}
