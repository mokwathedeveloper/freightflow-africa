import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { postLoadSchema } from '@/lib/validators';
import { sendSMS } from '@/lib/services/sms.service';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

const generateShortId = () => `FF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

// GET /api/loads — available loads for transporter (POSTED status)
export async function GET(req: NextRequest) {
  const auth = requireRole(req, 'TRANSPORTER');
  if ('error' in auth) return auth.error;

  const { searchParams } = new URL(req.url);
  const origin      = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const cargoType   = searchParams.get('cargoType');
  const page        = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit       = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));

  const where = {
    tenantId: auth.user.tenantId,
    status: 'POSTED' as const,
    ...(origin      && { origin:      { contains: origin,      mode: 'insensitive' as const } }),
    ...(destination && { destination: { contains: destination, mode: 'insensitive' as const } }),
    ...(cargoType   && { cargoType:   { contains: cargoType,   mode: 'insensitive' as const } }),
  };

  const [loads, total] = await Promise.all([
    prisma.load.findMany({
      where,
      include: { shipper: { select: { name: true, company: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.load.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: { loads, total, page, pages: Math.ceil(total / limit) },
  });
}

// POST /api/loads — shipper creates a load
export async function POST(req: NextRequest) {
  const auth = requireRole(req, 'SHIPPER');
  if ('error' in auth) return auth.error;

  try {
    const body = postLoadSchema.parse(await req.json());

    let load;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        load = await prisma.load.create({
          data: {
            shortId: generateShortId(),
            tenantId: auth.user.tenantId,
            shipperId: auth.user.userId,
            ...body,
            deliveryDate: new Date(body.deliveryDate),
          },
        });
        break;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002' && attempt < 4) continue;
        throw e;
      }
    }
    if (!load) throw new Error('Failed to create load after 5 attempts');

    await prisma.loadStatusLog.create({
      data: { loadId: load.id, status: 'POSTED', changedBy: auth.user.userId, channel: 'WEB' },
    });

    // Notify all active transporters in the tenant via AT SMS
    const transporters = await prisma.user.findMany({
      where: { tenantId: auth.user.tenantId, role: 'TRANSPORTER', isActive: true },
      select: { phone: true },
    });

    Promise.allSettled(
      transporters.map(({ phone }) =>
        sendSMS(phone, 'LOAD_POSTED', { origin: body.origin, destination: body.destination }, load.id)
      )
    ).catch((err) => console.error('[load-post-sms]', err));

    return NextResponse.json({ success: true, data: load }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ success: false, error: err.issues[0].message }, { status: 400 });
    }
    console.error('[loads-post]', err);
    return NextResponse.json({ success: false, error: 'Failed to post load' }, { status: 500 });
  }
}
