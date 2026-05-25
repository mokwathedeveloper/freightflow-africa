'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Notification } from '@/types';
import NotificationCard, {
  NotificationDetailModal,
  CHANNEL_LABEL,
} from '@/components/notifications/NotificationCard';

interface NotificationsResponse {
  data: { notifications: Notification[] };
}

const TABS = ['All', 'Loads', 'Tracking', 'System'] as const;
type Tab = typeof TABS[number];

type ChannelFilter = '' | 'SMS' | 'IN_APP' | 'VOICE';

const CHANNEL_OPTIONS: { value: ChannelFilter; label: string }[] = [
  { value: '',       label: 'All Channels' },
  { value: 'SMS',    label: CHANNEL_LABEL.SMS },
  { value: 'IN_APP', label: CHANNEL_LABEL.IN_APP },
  { value: 'VOICE',  label: CHANNEL_LABEL.VOICE },
];

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
  const qc = useQueryClient();
  const [tab,           setTab]           = useState<Tab>('All');
  const [channel,       setChannel]       = useState<ChannelFilter>('');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

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

  function handleCardClick(n: Notification) {
    setSelectedNotif(n);
    if (!n.isRead) markReadMut.mutate(n.id);
  }

  const all         = data?.data.notifications ?? [];
  const unreadCount = all.filter((n) => !n.isRead).length;

  const filtered = all.filter((n) => {
    if (tab === 'Loads'    && !isLoads(n.title))    return false;
    if (tab === 'Tracking' && !isTracking(n.title)) return false;
    if (tab === 'System'   && !isSystem(n.title))   return false;
    if (channel && n.channel !== channel)            return false;
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
            className="flex items-center gap-1.5 text-sm text-[#1E3A8A] hover:underline disabled:opacity-50 transition-opacity"
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

        {/* Channel filter strip */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-gray-100 overflow-x-auto">
          {CHANNEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setChannel(opt.value)}
              className={cn(
                'text-xs font-medium px-3 py-1 rounded-full border transition-colors whitespace-nowrap',
                channel === opt.value
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Content */}
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
              {tab === 'All' && !channel ? "You're all caught up!" : 'No matching notifications'}
            </p>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              {tab === 'All' && !channel
                ? 'Job updates will appear here and via SMS.'
                : 'Try a different tab or channel filter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={(id) => markReadMut.mutate(id)}
                isMarkingRead={markReadMut.isPending}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>

      {!isLoading && all.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          {all.length} notification{all.length !== 1 ? 's' : ''} total
          {unreadCount > 0 && ` · ${unreadCount} unread`}
        </p>
      )}

      {/* Notification detail modal */}
      <NotificationDetailModal
        notification={selectedNotif}
        onClose={() => setSelectedNotif(null)}
      />
    </div>
  );
}
