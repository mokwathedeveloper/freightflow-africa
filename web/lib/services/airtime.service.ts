import { airtime } from './at';
import { prisma } from '../prisma';

const REWARD = parseFloat(process.env.AIRTIME_REWARD_AMOUNT || '20');

export const disburseAirtimeReward = async (
  userId: string,
  phone: string,
  loadId?: string
): Promise<void> => {
  const log = await prisma.airtimeLog.create({
    data: { userId, phone, amount: REWARD, currency: 'KES', loadId: loadId ?? null },
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await airtime.send({
        recipients: [{ phoneNumber: phone, amount: `KES ${REWARD}` }],
      });
      const r = res.responses?.[0];

      if (r?.status === 'Success') {
        await prisma.airtimeLog.update({
          where: { id: log.id },
          data: { status: 'SUCCESS', atResponse: JSON.stringify(r), retryCount: attempt - 1 },
        });
        return;
      }

      // Definitive failure — do not retry
      await prisma.airtimeLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', atResponse: JSON.stringify(r), retryCount: attempt - 1 },
      });
      return;
    } catch (err) {
      console.error(`[airtime] attempt ${attempt} failed`, err);
      if (attempt === 3) {
        await prisma.airtimeLog.update({ where: { id: log.id }, data: { status: 'FAILED', retryCount: attempt } });
      } else {
        // Exponential backoff: 500ms, 1000ms
        await new Promise((r) => setTimeout(r, 500 * attempt));
      }
    }
  }
};
