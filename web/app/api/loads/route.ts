import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { postLoadSchema } from '@/lib/validators';
import { sendSMS } from '@/lib/services/sms.service';
import { ZodError } from 'zod';

const generateShortId = () => `FF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

// GET /api/loads — available loads for transporter (POSTED status)
export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'TRANSPORTER');
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const loads = await prisma.load.findMany({
    where: {
      tenantId: auth.user.tenantId,
      status: 'POSTED',
      ...(origin && { origin: { contains: origin, mode: 'insensitive' } }),
      ...(destination && { destination: { contains: destination, mode: 'insensitive' } }),
    },
    include: { shipper: { select: { name: true, company: true } } },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({ success: true, data: loads });
}

// POST /api/loads — shipper creates a load
export async function POST(req: NextRequest) {
  const auth = requireRole(req, 'SHIPPER');
  if ('error' in auth) return auth.error;

  try {
    const body = postLoadSchema.parse(await req.json());

    const load = await prisma.load.create({
      data: {
        shortId: generateShortId(),
        tenantId: auth.user.tenantId,
        shipperId: auth.user.userId,
        ...body,
        deliveryDate: new Date(body.deliveryDate),
      },
    });

    await prisma.loadStatusLog.create({
      data: { loadId: load.id, status: 'POSTED', changedBy: auth.user.userId, channel: 'WEB' },
    });

    // Notify all active transporters in the tenant via AT SMS
    const transporters = await prisma.user.findMany({
      where: { tenantId: auth.user.tenantId, role: 'TRANSPORTER', isActive: true },
      select: { phone: true },
    });

    transporters.forEach(({ phone }) =>
      sendSMS(phone, 'LOAD_POSTED', { origin: body.origin, destination: body.destination }, load.id)
    );

    return NextResponse.json({ success: true, data: load }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to post load' }, { status: 500 });
  }
}
