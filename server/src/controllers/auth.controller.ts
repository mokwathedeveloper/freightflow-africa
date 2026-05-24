import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendPhoneOTP, verifyOTP as checkOTP } from '../services/otp.service';
import { registerSchema, loginSchema, otpSchema } from '../utils/validators';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (existing) {
      res.status(409).json({ success: false, error: 'Phone number already registered' });
      return;
    }

    // Default tenant: global (multi-tenant can assign per-company later)
    let tenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
    if (!tenant) {
      tenant = await prisma.tenant.create({ data: { name: 'FreightFlow', slug: 'default' } });
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        phone: body.phone,
        name: body.name,
        passwordHash,
        role: body.role,
        company: body.company,
        vehicleType: body.vehicleType,
        numberPlate: body.numberPlate,
      },
    });

    await sendPhoneOTP(user.id, user.phone);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Check your phone for a verification code.',
      data: { userId: user.id, phone: user.phone },
    });
  } catch (err) {
    next(err);
  }
};

export const sendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      res.status(404).json({ success: false, error: 'Phone number not found' });
      return;
    }

    await sendPhoneOTP(user.id, phone);
    res.json({ success: true, message: 'OTP sent to your phone' });
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, otp } = otpSchema.parse(req.body);

    const isValid = await checkOTP(phone, otp);
    if (!isValid) {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
      return;
    }

    const user = await prisma.user.update({
      where: { phone },
      data: { isVerified: true },
    });

    const tokenPayload = { userId: user.id, role: user.role, tenantId: user.tenantId };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.json({
      success: true,
      data: { accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.isVerified) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    const tokenPayload = { userId: user.id, role: user.role, tenantId: user.tenantId };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, role: user.role, phone: user.phone },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(401).json({ success: false, error: 'Refresh token required' });
      return;
    }

    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({
      userId: payload.userId,
      role: payload.role,
      tenantId: payload.tenantId,
    });

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      // Always return 200 — don't reveal if phone exists
      res.json({ success: true, message: 'If this number is registered, an OTP has been sent.' });
      return;
    }

    await sendPhoneOTP(user.id, phone);
    res.json({ success: true, message: 'If this number is registered, an OTP has been sent.' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, otp, newPassword } = req.body;

    const isValid = await checkOTP(phone, otp);
    if (!isValid) {
      res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
      return;
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { phone }, data: { passwordHash } });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};
