'use client';

import { useState } from 'react';
import { LayoutDashboard, Package, PlusCircle, Bell, Settings, MapPin } from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard/shipper',               label: 'Overview',      icon: LayoutDashboard },
  { href: '/dashboard/shipper/post-load',     label: 'Post a Load',   icon: PlusCircle },
  { href: '/dashboard/shipper/shipments',     label: 'My Shipments',  icon: Package },
  { href: '/dashboard/shipper/track',         label: 'Track Cargo',   icon: MapPin },
  { href: '/dashboard/shipper/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/shipper/settings',      label: 'Settings',      icon: Settings },
];

export default function ShipperLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth('SHIPPER');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-30 md:relative md:flex md:translate-x-0 transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <DashboardSidebar role="Shipper" items={NAV} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          title="Shipper Dashboard"
          onMenuClick={() => setSidebarOpen((s) => !s)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
