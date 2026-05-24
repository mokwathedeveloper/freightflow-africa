'use client';

import { useState } from 'react';
import {
  LayoutDashboard, Users, Package, BarChart2, CreditCard,
  Bell, Settings, FileText, Menu, X, LogOut, Shield, Search,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard/admin',               label: 'Dashboard',            icon: LayoutDashboard },
  { href: '/dashboard/admin/users',         label: 'Users',                icon: Users },
  { href: '/dashboard/admin/loads',         label: 'Loads',                icon: Package },
  { href: '/dashboard/admin/analytics',     label: 'Analytics',            icon: BarChart2 },
  { href: '/dashboard/admin/subscriptions', label: 'Subscriptions',        icon: CreditCard },
  { href: '/dashboard/admin/alerts',        label: 'Alerts & Notifications', icon: Bell },
  { href: '/dashboard/admin/disputes',      label: 'Settings',             icon: Settings },
  { href: '/dashboard/admin/disputes',      label: 'Audit Logs',           icon: FileText },
];

function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  function handleLogout() {
    clearAuth();
    router.push('/auth/login');
  }

  return (
    <aside className="w-60 h-full bg-[#1E3A8A] flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">FreightFlow</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }, idx) => {
          const active = label === 'Dashboard'
            ? pathname === href
            : label === 'Settings' || label === 'Audit Logs'
              ? false
              : pathname.startsWith(href);
          return (
            <Link
              key={`${href}-${idx}`}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-2 py-3 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
            {(user?.name ?? 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name ?? 'Admin User'}</p>
            <p className="text-white/50 text-xs truncate">Super Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth('ADMIN');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-30 md:relative md:flex md:translate-x-0 transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-4 px-5 shrink-0">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="md:hidden text-gray-500 hover:text-gray-800 shrink-0"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]/40 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notifications bell */}
            <button className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>

            {/* Admin avatar */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-tight">Admin User</p>
                <p className="text-xs text-gray-400 leading-tight">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
