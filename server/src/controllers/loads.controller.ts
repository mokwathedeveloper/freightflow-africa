import { Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { sendSMS } from '../services/sms.service';
import { disburseAirtimeReward } from '../services/airtime.service';
import { AuthRequest } from '../types';
import { postLoadSchema, updateStatusSchema, confirmDeliverySchema, disputeSchema } from '../utils/validators';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const generateShortId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FF-${year}-${random}`;
};

export const getLoads = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { origin, destination, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const loads = await prisma.load.findMany({
      where: {
        tenantId: req.tenantId!,
        status: 'POSTED',
        ...(origin && { origin: { contains: String(origin), mode: 'insensitive' } }),
        ...(destination && { destination: { contains: String(destination), mode: 'insensitive' } }),
      },
      include: { shipper: { select: { name: true, phone: true, company: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    });

    res.json({ success: true, data: loads });
  } catch (err) {
    next(err);
  }
};

export const getMyLoads = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const loads = await prisma.load.findMany({
      where: {
        tenantId: req.tenantId!,
        ...(role === 'SHIPPER' ? { shipperId: userId } : { transporterId: userId }),
      },
      include: {
        shipper: { select: { name: true, phone: true } },
        transporter: { select: { name: true, phone: true, vehicleType: true, numberPlate: true, rating: true } },
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: loads });
  } catch (err) {
    next(err);
  }
};

export const getLoadById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const load = await prisma.load.findFirst({
      where: { id: req.params.id, tenantId: req.tenantId! },
      include: {
        shipper: { select: { name: true, phone: true, company: true } },
        transporter: { select: { name: true, phone: true, vehicleType: true, numberPlate: true, rating: true } },
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!load) {
      res.status(404).json({ success: false, error: 'Load not found' });
      return;
    }

    res.json({ success: true, data: load });
  } catch (err) {
    next(err);
  }
};

export const createLoad = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = postLoadSchema.parse(req.body);
    const shipperId = req.user!.userId;

    const load = await prisma.load.create({
      data: {
        shortId: generateShortId(),
        tenantId: req.tenantId!,
        shipperId,
        ...body,
        deliveryDate: new Date(body.deliveryDate),
      },
    });

    await prisma.loadStatusLog.create({
      data: { loadId: load.id, status: 'POSTED', changedBy: shipperId, channel: 'WEB' },
    });

    // Notify matching transporters (simplified — notify all in tenant)
    const transporters = await prisma.user.findMany({
      where: { tenantId: req.tenantId!, role: 'TRANSPORTER', isActive: true },
      select: { phone: true },
    });

    transporters.forEach(({ phone }) => {
      sendSMS(phone, 'LOAD_POSTED', { origin: body.origin, destination: body.destination }, load.id);
    });

    res.status(201).json({ success: true, data: load });
  } catch (err) {
    next(err);
  }
};

export const acceptLoad = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const transporterId = req.user!.userId;
    const { id } = req.params;

    const load = await prisma.load.findFirst({ where: { id, tenantId: req.tenantId!, status: 'POSTED' } });
    if (!load) {
      res.status(409).json({ success: false, error: 'Load is no longer available' });
      return;
    }

    const [updated] = await prisma.$transaction([
      prisma.load.update({
        where: { id },
        data: { transporterId, status: 'ACCEPTED', acceptedAt: new Date() },
        include: {
          shipper: { select: { phone: true, name: true } },
          transporter: { select: { name: true } },
        },
      }),
      prisma.loadStatusLog.create({
        data: { loadId: id, status: 'ACCEPTED', changedBy: transporterId, channel: 'WEB' },
      }),
    ]);

    await sendSMS(
      updated.shipper.phone,
      'LOAD_ACCEPTED',
      {
        loadShortId: updated.shortId,
        origin: updated.origin,
        destination: updated.destination,
        transporterName: updated.transporter?.name || '',
        trackUrl: `${APP_URL}/dashboard/shipper/track/${id}`,
      },
      id
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const updateLoadStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note } = updateStatusSchema.parse(req.body);
    const transporterId = req.user!.userId;
    const { id } = req.params;

    const load = await prisma.load.findFirst({
      where: { id, transporterId, tenantId: req.tenantId! },
      include: { shipper: { select: { phone: true } } },
    });

    if (!load) {
      res.status(404).json({ success: false, error: 'Load not found' });
      return;
    }

    const timestampField: Record<string, object> = {
      PICKED_UP: { pickedUpAt: new Date() },
      IN_TRANSIT: { inTransitAt: new Date() },
    };

    const updated = await prisma.load.update({
      where: { id },
      data: { status, lastLocation: note, ...timestampField[status] },
    });

    await prisma.loadStatusLog.create({
      data: { loadId: id, status, changedBy: transporterId, channel: 'WEB', note },
    });

    const smsEvent = status === 'PICKED_UP' ? 'CARGO_PICKUP' : 'IN_TRANSIT_UPDATE';
    await sendSMS(
      load.shipper.phone,
      smsEvent,
      { loadShortId: load.shortId, transporterName: '', checkpoint: note || load.destination },
      id
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const markDelivered = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const transporterId = req.user!.userId;
    const { id } = req.params;

    const load = await prisma.load.findFirst({
      where: { id, transporterId, tenantId: req.tenantId! },
      include: { shipper: { select: { phone: true } } },
    });

    if (!load) {
      res.status(404).json({ success: false, error: 'Load not found' });
      return;
    }

    await prisma.load.update({
      where: { id },
      data: { status: 'AWAITING_CONFIRMATION', deliveredAt: new Date() },
    });

    await prisma.loadStatusLog.create({
      data: { loadId: id, status: 'AWAITING_CONFIRMATION', changedBy: transporterId, channel: 'WEB' },
    });

    await sendSMS(load.shipper.phone, 'DELIVERY_REPORTED', { loadShortId: load.shortId }, id);

    res.json({ success: true, message: 'Delivery reported. Awaiting shipper confirmation.' });
  } catch (err) {
    next(err);
  }
};

export const confirmDelivery = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { rating, ratingNote } = confirmDeliverySchema.parse(req.body);
    const shipperId = req.user!.userId;
    const { id } = req.params;

    const load = await prisma.load.findFirst({
      where: { id, shipperId, tenantId: req.tenantId!, status: 'AWAITING_CONFIRMATION' },
      include: {
        transporter: { select: { phone: true, id: true, ratingCount: true, rating: true } },
        shipper: { select: { phone: true } },
      },
    });

    if (!load) {
      res.status(404).json({ success: false, error: 'Load not found or not awaiting confirmation' });
      return;
    }

    await prisma.load.update({
      where: { id },
      data: { status: 'DELIVERED', confirmedAt: new Date(), rating, ratingNote },
    });

    await prisma.loadStatusLog.create({
      data: { loadId: id, status: 'DELIVERED', changedBy: shipperId, channel: 'WEB' },
    });

    // Update transporter rating
    if (load.transporter) {
      const newCount = load.transporter.ratingCount + 1;
      const newRating = ((load.transporter.rating * load.transporter.ratingCount) + rating) / newCount;
      await prisma.user.update({
        where: { id: load.transporter.id },
        data: { rating: newRating, ratingCount: newCount },
      });

      await sendSMS(load.transporter.phone, 'DELIVERY_CONFIRMED', { loadShortId: load.shortId }, id);
      await sendSMS(load.shipper.phone, 'DELIVERY_CONFIRMED', { loadShortId: load.shortId }, id);

      // Airtime reward for on-time delivery with rating >= 4
      if (rating >= 4) {
        disburseAirtimeReward(load.transporter.id, load.transporter.phone, id);
      }
    }

    res.json({ success: true, message: 'Delivery confirmed successfully' });
  } catch (err) {
    next(err);
  }
};

export const raiseDispute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { description } = disputeSchema.parse(req.body);
    const shipperId = req.user!.userId;
    const { id } = req.params;

    const load = await prisma.load.findFirst({
      where: { id, shipperId, tenantId: req.tenantId! },
    });

    if (!load) {
      res.status(404).json({ success: false, error: 'Load not found' });
      return;
    }

    await prisma.$transaction([
      prisma.load.update({ where: { id }, data: { status: 'DISPUTED' } }),
      prisma.loadStatusLog.create({
        data: { loadId: id, status: 'DISPUTED', changedBy: shipperId, channel: 'WEB' },
      }),
      prisma.dispute.create({
        data: { tenantId: req.tenantId!, loadId: id, raisedById: shipperId, description },
      }),
    ]);

    res.json({ success: true, message: 'Dispute raised. Our team will review shortly.' });
  } catch (err) {
    next(err);
  }
};

export const cancelLoad = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shipperId = req.user!.userId;
    const { id } = req.params;

    const load = await prisma.load.findFirst({
      where: { id, shipperId, tenantId: req.tenantId!, status: 'POSTED' },
    });

    if (!load) {
      res.status(400).json({ success: false, error: 'Only POSTED loads can be cancelled' });
      return;
    }

    await prisma.load.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    await prisma.loadStatusLog.create({
      data: { loadId: id, status: 'CANCELLED', changedBy: shipperId, channel: 'WEB' },
    });

    res.json({ success: true, message: 'Load cancelled' });
  } catch (err) {
    next(err);
  }
};
