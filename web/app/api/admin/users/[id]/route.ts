import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import type { UserRole } from '@/types';

const VALID_ROLES: UserRole[] = ['SHIPPER', 'TRANSPORTER', 'ADMIN'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { id } = await params;
    const { isActive, role } = await req.json();

    const updateData: { isActive?: boolean; role?: UserRole } = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role && VALID_ROLES.includes(role as UserRole)) updateData.role = role as UserRole;

    const updated = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findFirst({
        where: { id, tenantId: auth.user.tenantId },
      });
      if (!target) return null;
      return tx.user.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, phone: true, role: true, isActive: true },
      });
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
