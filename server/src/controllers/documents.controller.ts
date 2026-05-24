import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

// Placeholder — full implementation in feature/cross-border-docs
export const uploadDocument = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(501).json({ success: false, error: 'Document upload coming in v2' });
  } catch (err) {
    next(err);
  }
};

export const listDocuments = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
};
