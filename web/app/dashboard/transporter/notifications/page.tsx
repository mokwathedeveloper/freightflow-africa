'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, CheckCheck, Loader2, Truck, CheckCircle,
  AlertTriangle, Package, Info, MapPin,
} from 'lucide-react';
import { formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Notification } from '@/types';

interface NotificationsResponse {
  data: { notifications: Notification[] };
}

const TABS = ['All', 'Loads', 'Tracking', 'System'] as const;
type Tab = typeof TABS[number];

function notifIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('transit') || t.includes('pickup') || t.includes('picked') || t.includes('location'))
    return { icon: MapPin,        bg: 'bg-amber-50',   color: 'text-amber-600' };
  if (t.includes('accept') || t.includes('assign') || t.includes('new load') || t.includes('available'))
    return { icon: Truck,         bg: 'bg-blue-50',    color: 'text-[#1E3A8A]' };
  if (t.includes('deliver') || t.includes('confirm'))
    return { icon: CheckCircle,   bg: 'bg-green-50',   color: 'text-green-600' };
  if (t.includes('dispute') || t.includes('delay') || t.includes('issue') || t.includes('alert'))
    return { icon: AlertTriangle, bg: 'bg-red-50',     color: 'text-red-600' };
  if (t.includes('load') || t.includes('job') || t.includes('cargo'))
    return { icon: Package,       bg: 'bg-purple-50',  color: 'text-purple-600' };
  return   { icon: Info,          bg: 'bg-gray-50',    color: 'text-gray-500' };
}

function isTracking(title: string) {
  const t = title.toLowerCase();
  return t.includes('transit') || t.includes('pickup') || t.includes('picked') ||
         t.includes('deliver') || t.includes('location') || t.includes('status') ||
         t.includes('arrived') || t.includes('en route') || t.includes('confirm');
}
function isLoads(title: string) {
  const t = title.toLowerCase();
  return t.includes('load') || t.includes('post') || t.includes('accept') ||
         t.includes('cargo') || t.includes('assign') || t.includes('new') ||
         t.includes('available') || t.includes('job');
}
function isSystem(title: string) {
  const t = title.toLowerCase();
  return t.includes('system') || t.includes('account') || t.includes('otp') ||
         t.includes('password') || t.includes('login') || t.includes('subscription') ||
         t.includes('reward') || t.includes('airtime');
}

export default function TransporterNotificationsPage() {
  const qc  = useQueryClient();
  const [tab, setTab] = useState<Tab>('All');

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    refetchInterval: 20_000,
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMut = useMutation({
    mutationFn: () =>
      Promise.all(
        (data?.data.notifications ?? [])
          .filter((n) => !n.isRead)
          .map((n) => api.patch(`/notifications/${n.id}/read`))
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const all         = data?.data.notifications ?? [];
  const unreadCount = all.filter((n) => !n.isRead).length;

  const filtered = all.filter((n) => {
    if (tab === 'Loads')    return isLoads(n.title);
    if (tab === 'Tracking') return isTracking(n.title);
    if (tab === 'System')   return isSystem(n.title);
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-semibold bg-[#1E3A8A] text-white rounded-full px-2 py-0.5 leading-none">
                {unreadCount > 99 ? '99+' : unreadCount} unread
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Job updates, tracking alerts, and system messages</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
            className="flex items-center gap-1.5 text-sm text-[#1E3A8A] hover:underline disabled:opacity-50"
          >
            {markAllMut.isPending
              ? <Loader2 className="animate-spin" size={13} />
              : <CheckCheck size={15} />}
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Panel ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                tab === t
                  ? 'text-[#1E3A8A] border-b-2 border-[#1E3A8A] bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              )}
            >
              {t}
              {t === 'All' && unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-gray-100 mt-2.5 shrink-0" />
                <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
              <Bell size={26} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {tab === 'All' ? "You're all caught up!" : `No ${tab.toLowerCase()} notifications`}
            </p>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              {tab === 'All'
                ? 'Job updates will appear here and via SMS.'
                : 'Switch to All to see all your notifications.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((n) => {
              const { icon: Icon, bg, color } = notifIcon(n.title);
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50/60',
                    !n.isRead && 'bg-blue-50/30'
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2.5 shrink-0',
                    n.isRead ? 'bg-transparent' : 'bg-[#1E3A8A]'
                  )} />
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium leading-snug', n.isRead ? 'text-gray-700' : 'text-gray-900')}>
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-2.5 mt-1.5">
                      <span className="text-xs text-gray-400">{formatDateTime(n.createdAt)}</span>
                      <span className="inline-flex items-center text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
                        SMS
                      </span>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => markReadMut.mutate(n.id)}
                      disabled={markReadMut.isPending}
                      className="text-gray-300 hover:text-[#1E3A8A] transition-colors shrink-0 mt-1"
                      title="Mark as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!isLoading && all.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          {all.length} notification{all.length !== 1 ? 's' : ''} total
          {unreadCount > 0 && ` · ${unreadCount} unread`}
        </p>
      )}
    </div>
  );
}
