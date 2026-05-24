import { Request, Response } from 'express';
import { prisma } from '../services/prisma';
import { sendSMS } from '../services/sms.service';
import { LoadStatus } from '../types';

const CON = (text: string) => `CON ${text}`;
const END = (text: string) => `END ${text}`;

const STATUS_LABELS: Record<string, string> = {
  '1': 'PICKED_UP',
  '2': 'IN_TRANSIT',
  '3': 'AWAITING_CONFIRMATION',
};

const STATUS_DISPLAY: Partial<Record<LoadStatus, string>> = {
  POSTED: 'Posted',
  ACCEPTED: 'Accepted',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  AWAITING_CONFIRMATION: 'Awaiting Confirmation',
  DELIVERED: 'Delivered',
};

export const handleUSSD = async (req: Request, res: Response): Promise<void> => {
  res.set('Content-Type', 'text/plain');

  const { sessionId, phoneNumber, text } = req.body as {
    sessionId: string;
    phoneNumber: string;
    text: string;
  };

  const steps = text ? text.split('*') : [];
  const level = steps.length;

  // Find the transporter by phone
  const user = await prisma.user.findUnique({
    where: { phone: phoneNumber },
    select: { id: true, name: true, role: true },
  });

  if (!user || user.role !== 'TRANSPORTER') {
    res.send(END('Welcome to FreightFlow.\nThis service is for registered transporters only.'));
    return;
  }

  // ── Level 0: Main menu ────────────────────────────────────────────────────
  if (text === '') {
    res.send(CON(
      `FreightFlow\nHello ${user.name}\n` +
      '1. Track Load\n' +
      '2. Update Status\n' +
      '3. My Jobs\n' +
      '0. Exit'
    ));
    return;
  }

  const main = steps[0];

  // ── Exit ──────────────────────────────────────────────────────────────────
  if (main === '0') {
    res.send(END('Thank you for using FreightFlow. Safe driving!'));
    return;
  }

  // ── Option 1: Track Load ──────────────────────────────────────────────────
  if (main === '1') {
    const activeLoads = await prisma.load.findMany({
      where: {
        transporterId: user.id,
        status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION'] },
      },
      select: { shortId: true, origin: true, destination: true, status: true },
      take: 5,
    });

    if (activeLoads.length === 0) {
      res.send(END('No active loads found.'));
      return;
    }

    if (level === 1) {
      const menu = activeLoads
        .map((l, i) => `${i + 1}. #${l.shortId} ${l.origin}→${l.destination}`)
        .join('\n');
      res.send(CON(`Select load:\n${menu}`));
      return;
    }

    const idx = parseInt(steps[1], 10) - 1;
    const selected = activeLoads[idx];
    if (!selected) {
      res.send(END('Invalid selection.'));
      return;
    }

    res.send(END(
      `Load #${selected.shortId}\n` +
      `Route: ${selected.origin} → ${selected.destination}\n` +
      `Status: ${STATUS_DISPLAY[selected.status] || selected.status}`
    ));
    return;
  }

  // ── Option 2: Update Status ───────────────────────────────────────────────
  if (main === '2') {
    const jobs = await prisma.load.findMany({
      where: {
        transporterId: user.id,
        status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] },
      },
      select: { id: true, shortId: true, origin: true, destination: true, status: true },
      take: 5,
    });

    if (jobs.length === 0) {
      res.send(END('No active jobs to update.'));
      return;
    }

    // Single job — skip job selection, go straight to status
    if (jobs.length === 1) {
      const job = jobs[0];

      if (level === 1) {
        res.send(CON(
          `Update #${job.shortId}\n` +
          '1. Picked Up\n' +
          '2. In Transit\n' +
          '3. Delivered'
        ));
        return;
      }

      const statusKey = STATUS_LABELS[steps[1]];
      if (!statusKey) {
        res.send(END('Invalid option. Please try again.'));
        return;
      }

      await updateLoadStatus(job.id, statusKey as LoadStatus, user.id, job, sessionId);
      res.send(END(`Status updated to: ${steps[1] === '3' ? 'Delivered' : statusKey.replace('_', ' ')}\nShipper has been notified.`));
      return;
    }

    // Multiple jobs — show job selection menu first
    if (level === 1) {
      const menu = jobs
        .map((j, i) => `${i + 1}. #${j.shortId} ${j.origin}→${j.destination}`)
        .join('\n');
      res.send(CON(`Select job to update:\n${menu}`));
      return;
    }

    const jobIdx = parseInt(steps[1], 10) - 1;
    const selectedJob = jobs[jobIdx];
    if (!selectedJob) {
      res.send(END('Invalid selection.'));
      return;
    }

    if (level === 2) {
      res.send(CON(
        `Update #${selectedJob.shortId}\n` +
        '1. Picked Up\n' +
        '2. In Transit\n' +
        '3. Delivered'
      ));
      return;
    }

    const statusKey = STATUS_LABELS[steps[2]];
    if (!statusKey) {
      res.send(END('Invalid option. Please try again.'));
      return;
    }

    await updateLoadStatus(selectedJob.id, statusKey as LoadStatus, user.id, selectedJob, sessionId);
    res.send(END(`Status updated: ${statusKey.replace(/_/g, ' ')}\nShipper has been notified.`));
    return;
  }

  // ── Option 3: My Jobs ─────────────────────────────────────────────────────
  if (main === '3') {
    const jobs = await prisma.load.findMany({
      where: { transporterId: user.id },
      select: { shortId: true, origin: true, destination: true, status: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    if (jobs.length === 0) {
      res.send(END('No jobs found.\nBrowse the app to accept loads.'));
      return;
    }

    const list = jobs
      .map((j) => `#${j.shortId}: ${STATUS_DISPLAY[j.status] || j.status}`)
      .join('\n');

    res.send(END(`Your recent jobs:\n${list}`));
    return;
  }

  res.send(END('Invalid option. Please try again.'));
};

async function updateLoadStatus(
  loadId: string,
  status: LoadStatus,
  userId: string,
  load: { id: string; shortId: string; origin: string; destination: string },
  sessionId: string
): Promise<void> {
  const updateData: Record<string, unknown> = { status };
  if (status === 'PICKED_UP') updateData.pickedUpAt = new Date();
  if (status === 'IN_TRANSIT') updateData.inTransitAt = new Date();
  if (status === 'AWAITING_CONFIRMATION') updateData.deliveredAt = new Date();

  await prisma.load.update({ where: { id: loadId }, data: updateData });

  await prisma.loadStatusLog.create({
    data: {
      loadId,
      status,
      changedBy: userId,
      channel: 'USSD',
      note: `USSD session: ${sessionId}`,
    },
  });

  // Notify shipper
  const fullLoad = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: { select: { phone: true } } },
  });

  if (fullLoad?.shipper) {
    const event = status === 'AWAITING_CONFIRMATION' ? 'DELIVERY_REPORTED'
                : status === 'PICKED_UP' ? 'CARGO_PICKUP'
                : 'IN_TRANSIT_UPDATE';

    sendSMS(fullLoad.shipper.phone, event, {
      loadShortId: load.shortId,
      checkpoint: load.destination,
    }, loadId);
  }
}
