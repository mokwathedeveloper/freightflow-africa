import { Router } from 'express';
import { requireRole } from '../middleware/rbac.middleware';
import {
  getAnalytics,
  listUsers,
  listDisputes,
  resolveDispute,
} from '../controllers/admin.controller';

export const adminRouter = Router();

adminRouter.use(requireRole('ADMIN'));

adminRouter.get('/analytics', getAnalytics);
adminRouter.get('/users', listUsers);
adminRouter.get('/disputes', listDisputes);
adminRouter.patch('/disputes/:id', resolveDispute);
