'use client';

import { Bell, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import NotificationsDrawer from '@/components/Notifications/NotificationsDrawer';

interface Props {
  title: string;
  notificationCount?: number;
  onMenuClick?: () => void;
}

export function DashboardHeader({ title, notificationCount = 0, onMenuClick }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [search,    setSearch]    = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const ROLE_PATH: Record<string, string> = { SHIPPER: 'shipper', TRANSPORTER: 'transporter', ADMIN: 'admin' };
  const safeRole = user?.role ? (ROLE_PATH[user.role] ?? 'shipper') : 'shipper';

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="md:hidden p-1 text-gray-500 hover:text-gray-700" aria-label="Toggle menu">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={15} className="absolute left-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search (coming soon)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled
            aria-label="Search — coming soon"
            className="pl-9 pr-4 h-9 w-52 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-400 placeholder:text-gray-400 outline-none cursor-not-allowed opacity-60"
          />
        </div>

        {/* Notification bell */}
        <button
          onClick={() => setNotifOpen(true)}
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Open notifications"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <button
          onClick={() => router.push(`/dashboard/${safeRole}/settings`)}
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-xs font-semibold text-white">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.name?.split(' ')[0]}
          </span>
        </button>
      </div>

      <NotificationsDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
}
