import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'FreightFlow API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});
