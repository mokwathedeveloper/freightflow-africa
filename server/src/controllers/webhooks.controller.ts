import { Request, Response } from 'express';
import { prisma } from '../services/prisma';
import logger from '../utils/logger';

export const smsDeliveryReport = async (req: Request, res: Response): Promise<void> => {
  const { id: atMessageId, status } = req.body;

  try {
    await prisma.smsLog.updateMany({
      where: { atMessageId },
      data: { status: status === 'Success' ? 'DELIVERED' : 'FAILED' },
    });
  } catch (err) {
    logger.error('SMS delivery webhook error', err);
  }

  res.status(200).send('OK');
};

export const voiceCallback = async (req: Request, res: Response): Promise<void> => {
  logger.info('Voice callback received', req.body);
  res.status(200).send('OK');
};
