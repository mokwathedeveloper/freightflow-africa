'use client';

import { useState } from 'react';
import { LayoutDashboard, Search, Briefcase, Bell, Settings, MapPin } from 'lucide-react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard/transporter',               label: 'Overview',      icon: LayoutDashboard },
  { href: '/dashboard/transporter/loads',         label: 'Browse Loads',  icon: Search },
  { href: '/dashboard/transporter/jobs',          label: 'My Jobs',       icon: Briefcase },
  { href: '/dashboard/transporter/track',         label: 'Track Route',   icon: MapPin },
  { href: '/dashboard/transporter/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/transporter/settings',      label: 'Settings',      icon: Settings },
];

export default function TransporterLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth('TRANSPORTER');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={cn(
        'fixed inset-y-0 left-0 z-30 md:relative md:flex md:translate-x-0 transition-transform duration-200',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <DashboardSidebar role="Transporter" items={NAV} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          title="Transporter Dashboard"
          onMenuClick={() => setSidebarOpen((s) => !s)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
