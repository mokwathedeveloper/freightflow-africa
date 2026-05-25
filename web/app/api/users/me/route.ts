import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.userId },
    select: {
      id: true, name: true, phone: true, email: true, role: true,
      company: true, vehicleType: true, numberPlate: true,
      rating: true, ratingCount: true, isVerified: true, createdAt: true,
    },
  });

  if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  const { name, email, company, vehicleType, numberPlate } = await req.json();

  const user = await prisma.user.update({
    where: { id: auth.user.userId },
    data: { name, email, company, vehicleType, numberPlate },
    select: { id: true, name: true, phone: true, email: true, role: true },
  });

  return NextResponse.json({ success: true, data: user });
}
