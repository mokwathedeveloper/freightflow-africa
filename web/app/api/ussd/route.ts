import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/services/sms.service';
import { LoadStatus } from '@prisma/client';

const CON = (t: string) => new Response(`CON ${t}`, { headers: { 'Content-Type': 'text/plain' } });
const END = (t: string) => new Response(`END ${t}`, { headers: { 'Content-Type': 'text/plain' } });

const STATUS_MAP: Record<string, LoadStatus> = {
  '1': 'PICKED_UP',
  '2': 'IN_TRANSIT',
  '3': 'AWAITING_CONFIRMATION',
};

const ALLOWED_TRANSITIONS: Partial<Record<LoadStatus, LoadStatus[]>> = {
  ACCEPTED:   ['PICKED_UP'],
  PICKED_UP:  ['IN_TRANSIT'],
  IN_TRANSIT: ['AWAITING_CONFIRMATION'],
};

const STATUS_DISPLAY: Partial<Record<LoadStatus, string>> = {
  POSTED: 'Posted', ACCEPTED: 'Accepted', PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit', AWAITING_CONFIRMATION: 'Awaiting Confirmation', DELIVERED: 'Delivered',
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const sessionId = formData.get('sessionId') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const text = (formData.get('text') as string) || '';

  const steps = text ? text.split('*') : [];
  const level = steps.length;

  const user = await prisma.user.findUnique({
    where: { phone: phoneNumber },
    select: { id: true, name: true, role: true },
  });

  if (!user || user.role !== 'TRANSPORTER') {
    return END('FreightFlow: This service is for registered transporters only.');
  }

  // Main menu
  if (text === '') {
    return CON(`FreightFlow\nHello ${user.name}\n1. Track Load\n2. Update Status\n3. My Jobs\n0. Exit`);
  }

  const main = steps[0];

  if (main === '0') return END('Thank you for using FreightFlow. Safe driving!');

  // ── Track Load ──────────────────────────────────────────────────────────────
  if (main === '1') {
    const loads = await prisma.load.findMany({
      where: { transporterId: user.id, status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION'] } },
      select: { shortId: true, origin: true, destination: true, status: true },
      take: 5,
    });

    if (loads.length === 0) return END('No active loads found.');

    if (level === 1) {
      return CON(`Select load:\n${loads.map((l, i) => `${i + 1}. #${l.shortId} ${l.origin}→${l.destination}`).join('\n')}`);
    }

    const sel = loads[parseInt(steps[1]) - 1];
    if (!sel) return END('Invalid selection.');
    return END(`Load #${sel.shortId}\n${sel.origin}→${sel.destination}\nStatus: ${STATUS_DISPLAY[sel.status]}`);
  }

  // ── Update Status ───────────────────────────────────────────────────────────
  if (main === '2') {
    const jobs = await prisma.load.findMany({
      where: { transporterId: user.id, status: { in: ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'] } },
      select: { id: true, shortId: true, origin: true, destination: true, status: true },
      take: 5,
    });

    if (jobs.length === 0) return END('No active jobs to update.');

    if (jobs.length === 1) {
      const job = jobs[0];
      if (level === 1) {
        return CON(`Update #${job.shortId}\n1. Picked Up\n2. In Transit\n3. Delivered`);
      }
      const newStatus = STATUS_MAP[steps[1]];
      if (!newStatus) return END('Invalid option.');
      const allowed = ALLOWED_TRANSITIONS[job.status] ?? [];
      if (!allowed.includes(newStatus)) return END('Invalid status transition for this load.');
      await applyStatusUpdate(job.id, newStatus, user.id, sessionId);
      return END(`Status updated: ${newStatus.replace(/_/g, ' ')}\nShipper notified.`);
    }

    // Multiple jobs
    if (level === 1) {
      return CON(`Select job:\n${jobs.map((j, i) => `${i + 1}. #${j.shortId}`).join('\n')}`);
    }
    const job = jobs[parseInt(steps[1]) - 1];
    if (!job) return END('Invalid selection.');

    if (level === 2) {
      return CON(`Update #${job.shortId}\n1. Picked Up\n2. In Transit\n3. Delivered`);
    }
    const newStatus = STATUS_MAP[steps[2]];
    if (!newStatus) return END('Invalid option.');
    const allowed = ALLOWED_TRANSITIONS[job.status] ?? [];
    if (!allowed.includes(newStatus)) return END('Invalid status transition for this load.');
    await applyStatusUpdate(job.id, newStatus, user.id, sessionId);
    return END(`Status updated: ${newStatus.replace(/_/g, ' ')}\nShipper notified.`);
  }

  // ── My Jobs ─────────────────────────────────────────────────────────────────
  if (main === '3') {
    const jobs = await prisma.load.findMany({
      where: { transporterId: user.id },
      select: { shortId: true, status: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });
    if (jobs.length === 0) return END('No jobs found.');
    return END(`Recent jobs:\n${jobs.map(j => `#${j.shortId}: ${STATUS_DISPLAY[j.status] || j.status}`).join('\n')}`);
  }

  return END('Invalid option. Please try again.');
}

async function applyStatusUpdate(loadId: string, status: LoadStatus, userId: string, sessionId: string) {
  const timestamps: Record<string, object> = {
    PICKED_UP: { pickedUpAt: new Date() },
    IN_TRANSIT: { inTransitAt: new Date() },
    AWAITING_CONFIRMATION: { deliveredAt: new Date() },
  };

  await prisma.load.update({ where: { id: loadId }, data: { status, ...timestamps[status] } });
  await prisma.loadStatusLog.create({
    data: { loadId, status, changedBy: userId, channel: 'USSD', note: `session:${sessionId}` },
  });

  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { shipper: { select: { phone: true } } },
  });

  if (load?.shipper?.phone) {
    const event = status === 'AWAITING_CONFIRMATION' ? 'DELIVERY_REPORTED'
                : status === 'PICKED_UP' ? 'CARGO_PICKUP' : 'IN_TRANSIT_UPDATE';
    try {
      await sendSMS(load.shipper.phone, event, { loadShortId: load.shortId, checkpoint: load.destination }, loadId);
    } catch (err) {
      console.error('[ussd-sms]', err);
    }
  }
}
