'use client';

import { Bell, LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

interface Props {
  title: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ title, onMenuClick }: Props) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  function handleLogout() {
    clearAuth();
    router.replace('/auth/login');
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="md:hidden text-muted-foreground hover:text-foreground">
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/dashboard/${user?.role.toLowerCase()}/notifications`)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-foreground hidden sm:block">
            {user?.name.split(' ')[0]}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
