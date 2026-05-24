'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Notification } from '@/types';

interface NotificationsResponse {
  data: { notifications: Notification[] };
}

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((r) => r.data),
    refetchInterval: 20_000,
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data.notifications ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Notifications {unread > 0 && <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">{unread}</span>}
        </h2>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-muted-foreground" size={24} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="mx-auto text-muted-foreground mb-3" size={32} />
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn('flex items-start gap-4 px-5 py-4', !n.isRead && 'bg-primary/5')}
              >
                <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', n.isRead ? 'bg-transparent' : 'bg-primary')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markReadMut.mutate(n.id)}
                    disabled={markReadMut.isPending}
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
