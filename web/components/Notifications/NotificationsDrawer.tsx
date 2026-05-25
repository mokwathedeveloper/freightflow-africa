'use client';

import React, { useEffect, useRef } from 'react';
import { X, Bell, CheckCheck, Package, Truck, AlertTriangle, Info } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Notification } from '@/types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function notifIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('load') || t.includes('cargo')) return <Package size={15} className="text-[#1E3A8A]" />;
  if (t.includes('transit') || t.includes('pickup') || t.includes('driver')) return <Truck size={15} className="text-amber-600" />;
  if (t.includes('dispute') || t.includes('issue') || t.includes('alert')) return <AlertTriangle size={15} className="text-red-500" />;
  return <Info size={15} className="text-gray-400" />;
}

const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const { data, isLoading } = useQuery<{ data: Notification[] }>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    enabled: isOpen,
    refetchInterval: isOpen ? 30_000 : false,
  });

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.isRead);

  const markReadMut = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMut = useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Notifications"
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-96 max-w-full bg-white shadow-xl flex flex-col transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-[#1E3A8A]" />
            <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
            {unread.length > 0 && (
              <span className="text-xs font-bold bg-[#1E3A8A] text-white rounded-full px-2 py-0.5">
                {unread.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread.length > 0 && (
              <button
                onClick={() => markAllMut.mutate()}
                disabled={markAllMut.isPending}
                className="text-xs text-[#1E3A8A] hover:underline flex items-center gap-1 font-medium"
                aria-label="Mark all as read"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors rounded-lg p-1 hover:bg-gray-100"
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-100 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
              <Bell size={32} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">You&apos;ll see load updates and alerts here.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => { if (!n.isRead) markReadMut.mutate(n.id); }}
                className={cn(
                  'w-full text-left px-5 py-4 flex gap-3 hover:bg-gray-50 transition-colors',
                  !n.isRead && 'bg-blue-50/50',
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  !n.isRead ? 'bg-[#1E3A8A]/10' : 'bg-gray-100',
                )}>
                  {notifIcon(n.title)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                      'text-sm leading-snug',
                      !n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700',
                    )}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#1E3A8A] shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 shrink-0">
            <p className="text-xs text-gray-400 text-center">
              Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsDrawer;
