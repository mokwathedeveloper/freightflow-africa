import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LoadStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_LABELS: Record<LoadStatus, string> = {
  POSTED: 'Posted',
  ACCEPTED: 'Accepted',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  AWAITING_CONFIRMATION: 'Awaiting Confirmation',
  DELIVERED: 'Delivered',
  DISPUTED: 'Disputed',
  CANCELLED: 'Cancelled',
  REFUND_PENDING: 'Refund Pending',
};

export const STATUS_COLORS: Record<LoadStatus, string> = {
  POSTED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-indigo-100 text-indigo-800',
  PICKED_UP: 'bg-purple-100 text-purple-800',
  IN_TRANSIT: 'bg-amber-100 text-amber-800',
  AWAITING_CONFIRMATION: 'bg-yellow-100 text-yellow-800',
  DELIVERED: 'bg-green-100 text-green-800',
  DISPUTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  REFUND_PENDING: 'bg-orange-100 text-orange-800',
};

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatPhone = (phone: string): string =>
  phone.replace(/(\+254)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
