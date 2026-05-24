'use client';

import { useState } from 'react';
import { LayoutDashboard, Package, PlusCircle, Bell, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard/shipper', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/shipper/post-load', label: 'Post a Load', icon: PlusCircle },
  { href: '/dashboard/shipper/shipments', label: 'My Shipments', icon: Package },
  { href: '/dashboard/shipper/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/shipper/settings', label: 'Settings', icon: Settings },
];

export default function ShipperLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth('SHIPPER');
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return null;

  const footer = (
    <button
      onClick={() => { clearAuth(); router.replace('/auth/login'); }}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <LogOut size={16} /> Log out
    </button>
  );

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-30 md:relative md:flex md:translate-x-0 transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <DashboardSidebar
          brand="FreightFlow"
          role="shipper"
          items={NAV}
          footer={footer}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          title="Shipper Dashboard"
          onMenuClick={() => setSidebarOpen((s) => !s)}
        />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
