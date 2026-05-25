import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
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

    const action = role ? 'USER_ROLE_CHANGED' : isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
    logAudit({
      userId: auth.user.userId,
      tenantId: auth.user.tenantId,
      action,
      resource: 'User',
      resourceId: id,
      metadata: role ? { newRole: role } : { isActive },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = requireRole(req, 'ADMIN');
    if ('error' in auth) return auth.error;

    const { id } = await params;

    const deleted = await prisma.$transaction(async (tx) => {
      const target = await tx.user.findFirst({
        where: { id, tenantId: auth.user.tenantId },
      });
      if (!target) return null;
      if (target.role === 'ADMIN') {
        throw new Error('Cannot delete admin accounts');
      }
      return tx.user.delete({ where: { id } });
    });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    logAudit({
      userId: auth.user.userId,
      tenantId: auth.user.tenantId,
      action: 'USER_DELETED',
      resource: 'User',
      resourceId: id,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to delete user';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
