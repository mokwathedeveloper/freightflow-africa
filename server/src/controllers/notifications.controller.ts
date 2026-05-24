import { Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { AuthRequest } from '../types';

export const listNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId, tenantId: req.tenantId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
};
