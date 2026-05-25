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

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  company?: string;
  vehicleType?: string;
  numberPlate?: string;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
}

export interface Load {
  id: string;
  shortId: string;
  tenantId: string;
  shipperId: string;
  transporterId?: string;
  status: LoadStatus;
  origin: string;
  destination: string;
  cargoType: string;
  weight: number;
  deliveryDate: string;
  notes?: string;
  preferredVehicle?: string;
  lastLocation?: string;
  rating?: number;
  acceptedAt?: string;
  pickedUpAt?: string;
  inTransitAt?: string;
  deliveredAt?: string;
  confirmedAt?: string;
  createdAt: string;
  shipper?: Pick<User, 'name' | 'phone' | 'company'>;
  transporter?: Pick<User, 'name' | 'phone' | 'vehicleType' | 'numberPlate' | 'rating' | 'ratingCount'>;
  statusLogs?: StatusLog[];
}

export interface StatusLog {
  id: string;
  loadId: string;
  status: LoadStatus;
  channel: 'WEB' | 'USSD' | 'SYSTEM';
  changedBy: string;
  note?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  loadId?: string;
  channel: 'SMS' | 'IN_APP' | 'VOICE';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  company?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BillingRecord {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  date: string;
  invoiceUrl?: string;
}

export type DocStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
export type DocType =
  | 'COMMERCIAL_INVOICE'
  | 'PACKING_LIST'
  | 'BILL_OF_LADING'
  | 'CUSTOMS_DECLARATION'
  | 'OTHER';

export interface Document {
  id: string;
  tenantId: string;
  userId: string;
  loadId?: string;
  type: DocType;
  status: DocStatus;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  rejectNote?: string;
  createdAt: string;
  updatedAt: string;
}
