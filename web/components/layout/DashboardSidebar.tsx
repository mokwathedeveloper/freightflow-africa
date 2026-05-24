'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  brand: string;
  role: string;
  items: NavItem[];
  footer?: React.ReactNode;
}

export function DashboardSidebar({ brand, role, items, footer }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
        <div>
          <p className="font-bold text-foreground text-sm">{brand}</p>
          <p className="text-xs text-muted-foreground capitalize">{role} dashboard</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {footer && (
        <div className="p-3 border-t border-border shrink-0">{footer}</div>
      )}
    </aside>
  );
}
