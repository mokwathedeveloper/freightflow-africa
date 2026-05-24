import { Router } from 'express';
import { smsDeliveryReport, voiceCallback } from '../controllers/webhooks.controller';

export const webhooksRouter = Router();

webhooksRouter.post('/sms-delivery', smsDeliveryReport);
webhooksRouter.post('/voice', voiceCallback);
