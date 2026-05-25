'use client';

import {
  Truck, CheckCircle, AlertTriangle, Package,
  Info, MapPin, CheckCheck,
} from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import type { Notification } from '@/types';
import Modal from '@/components/Modal/Modal';

export function notifIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('transit') || t.includes('pickup') || t.includes('picked') || t.includes('location'))
    return { icon: MapPin,        bg: 'bg-amber-50',  color: 'text-amber-600' };
  if (t.includes('accept') || t.includes('assign') || t.includes('new load') || t.includes('available'))
    return { icon: Truck,         bg: 'bg-blue-50',   color: 'text-[#1E3A8A]' };
  if (t.includes('deliver') || t.includes('confirm'))
    return { icon: CheckCircle,   bg: 'bg-green-50',  color: 'text-green-600' };
  if (t.includes('dispute') || t.includes('delay') || t.includes('issue') || t.includes('alert'))
    return { icon: AlertTriangle, bg: 'bg-red-50',    color: 'text-red-600' };
  if (t.includes('load') || t.includes('job') || t.includes('cargo'))
    return { icon: Package,       bg: 'bg-purple-50', color: 'text-purple-600' };
  return   { icon: Info,          bg: 'bg-gray-50',   color: 'text-gray-500' };
}

const CHANNEL_BADGE: Record<Notification['channel'], string> = {
  SMS:    'bg-green-50  text-green-700  border-green-200',
  IN_APP: 'bg-blue-50   text-blue-700   border-blue-200',
  VOICE:  'bg-purple-50 text-purple-700 border-purple-200',
};

export const CHANNEL_LABEL: Record<Notification['channel'], string> = {
  SMS:    'SMS',
  IN_APP: 'In-App',
  VOICE:  'Voice',
};

// ─── Card row ────────────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isMarkingRead: boolean;
  onClick: (notification: Notification) => void;
}

export default function NotificationCard({
  notification: n,
  onMarkRead,
  isMarkingRead,
  onClick,
}: NotificationCardProps) {
  const { icon: Icon, bg, color } = notifIcon(n.title);

  return (
    <div className={cn(
      'flex items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50/60',
      !n.isRead && 'bg-blue-50/30',
    )}>
      {/* Unread dot */}
      <div className={cn(
        'w-2 h-2 rounded-full mt-2.5 shrink-0 transition-colors',
        n.isRead ? 'bg-transparent' : 'bg-[#1E3A8A]',
      )} />

      {/* Type icon */}
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
        <Icon size={16} className={color} />
      </div>

      {/* Clickable content */}
      <button
        className="flex-1 min-w-0 text-left"
        onClick={() => onClick(n)}
        aria-label={`View details: ${n.title}`}
      >
        <p className={cn('text-sm font-medium leading-snug', n.isRead ? 'text-gray-700' : 'text-gray-900')}>
          {n.title}
        </p>
        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
          {n.body}
        </p>
        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="text-xs text-gray-400">{formatDateTime(n.createdAt)}</span>
          <span className={cn(
            'inline-flex items-center text-xs border px-1.5 py-0.5 rounded-full font-medium',
            CHANNEL_BADGE[n.channel],
          )}>
            {CHANNEL_LABEL[n.channel]}
          </span>
        </div>
      </button>

      {/* Mark read */}
      {!n.isRead && (
        <button
          onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
          disabled={isMarkingRead}
          className="text-gray-300 hover:text-[#1E3A8A] transition-colors shrink-0 mt-1 disabled:opacity-50"
          title="Mark as read"
          aria-label="Mark as read"
        >
          <CheckCheck size={16} />
        </button>
      )}
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

interface NotificationDetailModalProps {
  notification: Notification | null;
  onClose: () => void;
}

export function NotificationDetailModal({ notification: n, onClose }: NotificationDetailModalProps) {
  if (!n) return null;
  const { icon: Icon, bg, color } = notifIcon(n.title);

  return (
    <Modal isOpen={!!n} onClose={onClose} title="Notification Details" size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', bg)}>
            <Icon size={18} className={color} />
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{n.title}</p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">{n.body}</p>

        <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
          <span className={cn(
            'inline-flex items-center text-xs border px-2 py-0.5 rounded-full font-medium',
            CHANNEL_BADGE[n.channel],
          )}>
            {CHANNEL_LABEL[n.channel]}
          </span>
          <span className="text-xs text-gray-400">{formatDateTime(n.createdAt)}</span>
        </div>
      </div>
    </Modal>
  );
}
