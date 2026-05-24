import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

export const tenantMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.tenantId) {
    res.status(401).json({ success: false, error: 'Tenant context missing' });
    return;
  }

  req.tenantId = req.user.tenantId;
  next();
};
