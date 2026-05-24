'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Truck, LogOut } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  role: string;
  items: NavItem[];
}

export function DashboardSidebar({ role, items }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  function handleLogout() {
    clearAuth();
    router.replace('/auth/login');
  }

  return (
    <aside
      className="w-64 flex flex-col h-full shrink-0"
      style={{ backgroundColor: '#1E3A8A' }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
          <Truck size={18} className="text-[#1E3A8A]" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">FreightFlow</p>
          <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.6)' }}>{role} Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== `/dashboard/${role.toLowerCase()}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'text-white'
                  : 'hover:text-white'
              )}
              style={
                active
                  ? { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }
                  : { color: 'rgba(255,255,255,0.75)' }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '';
              }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.75)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)'; }}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
