import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export type UserRole = 'SHIPPER' | 'TRANSPORTER' | 'ADMIN';

export interface JWTPayload {
  userId: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET env vars must be set');
}
const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const signAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });

export const signRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });

function isJWTPayload(payload: unknown): payload is JWTPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as JWTPayload).userId === 'string' &&
    typeof (payload as JWTPayload).role === 'string' &&
    typeof (payload as JWTPayload).tenantId === 'string'
  );
}

export const verifyAccessToken = (token: string): JWTPayload => {
  const payload = jwt.verify(token, ACCESS_SECRET);
  if (!isJWTPayload(payload)) throw new Error('Invalid token payload');
  return payload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  const payload = jwt.verify(token, REFRESH_SECRET);
  if (!isJWTPayload(payload)) throw new Error('Invalid token payload');
  return payload;
};

// Extract and verify JWT from an incoming API route request
export const getAuthUser = (req: NextRequest): JWTPayload | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) return null;

  try {
    return verifyAccessToken(parts[1]);
  } catch {
    return null;
  }
};

// Use inside API route handlers — returns 401 response if not authenticated
export const requireAuth = (req: NextRequest): { user: JWTPayload } | { error: Response } => {
  const user = getAuthUser(req);
  if (!user) {
    return {
      error: Response.json({ success: false, error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { user };
};

// Extend requireAuth with role check
export const requireRole = (
  req: NextRequest,
  ...roles: UserRole[]
): { user: JWTPayload } | { error: Response } => {
  const result = requireAuth(req);
  if ('error' in result) return result;

  if (!roles.includes(result.user.role)) {
    return {
      error: Response.json({ success: false, error: 'Forbidden' }, { status: 403 }),
    };
  }

  return result;
};
