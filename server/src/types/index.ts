import { Request } from 'express';

export type UserRole = 'SHIPPER' | 'TRANSPORTER' | 'ADMIN';

export type LoadStatus =
  | 'POSTED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'AWAITING_CONFIRMATION'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'REFUND_PENDING';

export type NotificationChannel = 'SMS' | 'IN_APP' | 'VOICE';
export type UpdateChannel = 'WEB' | 'USSD' | 'SYSTEM';

export interface JWTPayload {
  userId: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
  tenantId?: string;
}

export interface SMSTemplate {
  to: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
