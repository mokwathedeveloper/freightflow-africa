import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: insufficient permissions' });
      return;
    }

    next();
  };
};
