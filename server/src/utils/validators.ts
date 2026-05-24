import { z } from 'zod';

export const registerSchema = z.object({
  phone: z.string().regex(/^\+254[0-9]{9}$/, 'Phone must be in E.164 format (+254XXXXXXXXX)'),
  name: z.string().min(2).max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['SHIPPER', 'TRANSPORTER']),
  company: z.string().optional(),
  vehicleType: z.string().optional(),
  numberPlate: z.string().optional(),
});

export const loginSchema = z.object({
  phone: z.string().regex(/^\+254[0-9]{9}$/),
  password: z.string().min(1),
});

export const otpSchema = z.object({
  phone: z.string().regex(/^\+254[0-9]{9}$/),
  otp: z.string().length(6).regex(/^\d{6}$/),
});

export const postLoadSchema = z.object({
  origin: z.string().min(2).max(200),
  destination: z.string().min(2).max(200),
  cargoType: z.string().min(1),
  weight: z.number().positive(),
  deliveryDate: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION']),
  note: z.string().max(200).optional(),
});

export const confirmDeliverySchema = z.object({
  rating: z.number().int().min(1).max(5),
  ratingNote: z.string().max(300).optional(),
});

export const disputeSchema = z.object({
  description: z.string().min(10).max(1000),
});
