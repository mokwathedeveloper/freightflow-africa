import { Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { AuthRequest } from '../types';

export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId!;

    const [totalLoads, delivered, disputed, activeUsers] = await Promise.all([
      prisma.load.count({ where: { tenantId } }),
      prisma.load.count({ where: { tenantId, status: 'DELIVERED' } }),
      prisma.load.count({ where: { tenantId, status: 'DISPUTED' } }),
      prisma.user.count({ where: { tenantId, isActive: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalLoads,
        delivered,
        disputed,
        deliveryRate: totalLoads ? Math.round((delivered / totalLoads) * 100) : 0,
        activeUsers,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.tenantId! },
      select: {
        id: true, name: true, phone: true, role: true, isVerified: true,
        isActive: true, rating: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const listDisputes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const disputes = await prisma.dispute.findMany({
      where: { tenantId: req.tenantId! },
      include: {
        load: { select: { shortId: true, origin: true, destination: true } },
        raisedBy: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: disputes });
  } catch (err) {
    next(err);
  }
};

export const resolveDispute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resolution, finalStatus } = req.body;
    const adminId = req.user!.userId;

    await prisma.dispute.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', resolution, resolvedById: adminId },
    });

    if (finalStatus) {
      const dispute = await prisma.dispute.findUnique({ where: { id: req.params.id } });
      if (dispute) {
        await prisma.load.update({
          where: { id: dispute.loadId },
          data: { status: finalStatus },
        });
      }
    }

    res.json({ success: true, message: 'Dispute resolved' });
  } catch (err) {
    next(err);
  }
};
