import { airtime } from './at';
import { prisma } from './prisma';
import logger from '../utils/logger';

const REWARD_AMOUNT = parseFloat(process.env.AIRTIME_REWARD_AMOUNT || '20');
const CURRENCY = 'KES';
const MAX_RETRIES = 3;

export const disburseAirtimeReward = async (
  userId: string,
  phone: string,
  loadId?: string
): Promise<void> => {
  const log = await prisma.airtimeLog.create({
    data: { userId, phone, amount: REWARD_AMOUNT, currency: CURRENCY, loadId: loadId || null },
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await airtime.send({
        recipients: [{ phoneNumber: phone, amount: `${CURRENCY} ${REWARD_AMOUNT}` }],
      });

      const result = response.responses?.[0];
      const success = result?.status === 'Success';

      await prisma.airtimeLog.update({
        where: { id: log.id },
        data: {
          status: success ? 'SUCCESS' : 'FAILED',
          atResponse: JSON.stringify(result),
          retryCount: attempt - 1,
        },
      });

      if (success) {
        logger.info(`Airtime reward KES ${REWARD_AMOUNT} sent to ${phone}`);
        return;
      }

      logger.warn(`Airtime attempt ${attempt} failed for ${phone}`);
    } catch (err) {
      logger.error(`Airtime error attempt ${attempt} for ${phone}`, err);
    }

    if (attempt < MAX_RETRIES) {
      // Wait 15 minutes between retries (non-blocking via background job in prod)
      await new Promise((r) => setTimeout(r, 15 * 60 * 1000));
    }
  }

  await prisma.airtimeLog.update({
    where: { id: log.id },
    data: { status: 'FAILED', retryCount: MAX_RETRIES },
  });
};
