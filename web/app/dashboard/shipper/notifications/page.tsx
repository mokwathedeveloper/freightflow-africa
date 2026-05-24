'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2, Package, Truck, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Notification } from '@/types';

interface NotificationsResponse {
  data: { notifications: Notification[] };
}

const TABS = ['All', 'Unread', 'Loads', 'System'] as const;
type Tab = typeof TABS[number];

function notifIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('accept') || t.includes('transit') || t.includes('picked'))
    return { icon: Truck,         bg: 'bg-blue-50',   color: 'text-[#1E3A8A]' };
  if (t.includes('deliver') || t.includes('confirm'))
    return { icon: CheckCircle,   bg: 'bg-green-50',  color: 'text-green-600' };
  if (t.includes('dispute') || t.includes('delay') || t.includes('issue'))
    return { icon: AlertTriangle, bg: 'bg-amber-50',  color: 'text-amber-600' };
  if (t.includes('load') || t.includes('post'))
    return { icon: Package,       bg: 'bg-purple-50', color: 'text-purple-600' };
  return   { icon: Info,          bg: 'bg-gray-50',   color: 'text-gray-500' };
}

export default function NotificationsPage() {
  const qc = useQueryClient();
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
    mutationFn: () => Promise.all(
      (data?.data.notifications ?? [])
        .filter((n) => !n.isRead)
        .map((n) => api.patch(`/notifications/${n.id}/read`))
    ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const all = data?.data.notifications ?? [];
  const unreadCount = all.filter((n) => !n.isRead).length;

  const filtered = all.filter((n) => {
    if (tab === 'Unread') return !n.isRead;
    if (tab === 'Loads')  return n.title.toLowerCase().includes('load') || n.title.toLowerCase().includes('cargo') || n.title.toLowerCase().includes('transit') || n.title.toLowerCase().includes('deliver');
    if (tab === 'System') return n.title.toLowerCase().includes('system') || n.title.toLowerCase().includes('account') || n.title.toLowerCase().includes('otp');
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-semibold bg-[#1E3A8A] text-white rounded-full px-2 py-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Load updates, alerts, and system messages</p>
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

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-3 text-sm font-medium transition-colors',
                tab === t
                  ? 'text-[#1E3A8A] border-b-2 border-[#1E3A8A] bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              )}
            >
              {t}
              {t === 'Unread' && unreadCount > 0 && (
                <span className="ml-1.5 text-xs bg-red-100 text-red-600 rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-sm font-medium text-gray-500">
              {tab === 'Unread' ? "You're all caught up!" : 'No notifications here'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tab === 'Unread'
                ? 'Load updates will appear here and via SMS.'
                : 'Try a different tab to see your notifications.'}
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
                    'flex items-start gap-4 px-5 py-4 transition-colors',
                    !n.isRead && 'bg-blue-50/40'
                  )}
                >
                  {/* Unread dot */}
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-2.5 shrink-0',
                    n.isRead ? 'bg-transparent' : 'bg-[#1E3A8A]'
                  )} />

                  {/* Icon */}
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
                    <Icon size={16} className={color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', n.isRead ? 'text-gray-700' : 'text-gray-900')}>
                      {n.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
                      {/* Channel badge */}
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
                        SMS
                      </span>
                    </div>
                  </div>

                  {/* Mark read */}
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
    </div>
  );
}
