import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface AuditParams {
  userId?: string;
  actorName?: string;
  tenantId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        ...params,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Audit logging must never break the main request flow
  }
}
