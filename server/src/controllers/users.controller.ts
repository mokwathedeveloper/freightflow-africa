import { Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { AuthRequest } from '../types';

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, name: true, phone: true, email: true, role: true,
        company: true, vehicleType: true, numberPlate: true,
        rating: true, ratingCount: true, isVerified: true, createdAt: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, company, vehicleType, numberPlate } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, email, company, vehicleType, numberPlate },
      select: { id: true, name: true, phone: true, email: true, role: true },
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
