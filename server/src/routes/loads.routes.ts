import { Router } from 'express';
import {
  getLoads,
  getMyLoads,
  getLoadById,
  createLoad,
  acceptLoad,
  updateLoadStatus,
  markDelivered,
  confirmDelivery,
  raiseDispute,
  cancelLoad,
} from '../controllers/loads.controller';
import { requireRole } from '../middleware/rbac.middleware';

export const loadsRouter = Router();

loadsRouter.get('/', requireRole('TRANSPORTER'), getLoads);
loadsRouter.get('/my', getMyLoads);
loadsRouter.get('/:id', getLoadById);
loadsRouter.post('/', requireRole('SHIPPER'), createLoad);
loadsRouter.post('/:id/accept', requireRole('TRANSPORTER'), acceptLoad);
loadsRouter.patch('/:id/status', requireRole('TRANSPORTER'), updateLoadStatus);
loadsRouter.post('/:id/deliver', requireRole('TRANSPORTER'), markDelivered);
loadsRouter.post('/:id/confirm', requireRole('SHIPPER'), confirmDelivery);
loadsRouter.post('/:id/dispute', requireRole('SHIPPER'), raiseDispute);
loadsRouter.post('/:id/cancel', requireRole('SHIPPER'), cancelLoad);
