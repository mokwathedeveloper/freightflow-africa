'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package, Truck, CheckCircle, AlertTriangle, PlusCircle, ChevronRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Load } from '@/types';

interface MyLoadsResponse {
  data: { loads: Load[]; total: number };
}

function KPI({ label, value, icon: Icon, color }: {
  label: string; value: number | string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function ShipperPage() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery<MyLoadsResponse>({
    queryKey: ['shipper-loads'],
    queryFn: () => api.get('/loads/my?limit=50').then((r) => r.data),
    enabled: !!user,
  });

  const loads = data?.data.loads ?? [];
  const total = loads.length;
  const active = loads.filter((l) => ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(l.status)).length;
  const delivered = loads.filter((l) => l.status === 'DELIVERED').length;
  const disputed = loads.filter((l) => l.status === 'DISPUTED').length;
  const recent = loads.slice(0, 5);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Good day, {user?.name.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-muted-foreground">Here&apos;s your freight overview</p>
        </div>
        <Link href="/dashboard/shipper/post-load" className={buttonVariants({ size: 'sm' })}>
          <PlusCircle size={15} /> Post a Load
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Loads" value={isLoading ? '—' : total} icon={Package} color="bg-blue-100 text-blue-600" />
        <KPI label="In Transit" value={isLoading ? '—' : active} icon={Truck} color="bg-amber-100 text-amber-600" />
        <KPI label="Delivered" value={isLoading ? '—' : delivered} icon={CheckCircle} color="bg-green-100 text-green-600" />
        <KPI label="Disputed" value={isLoading ? '—' : disputed} icon={AlertTriangle} color="bg-red-100 text-red-600" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Shipments</h3>
          <Link href="/dashboard/shipper/shipments" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded w-40 flex-1" />
                <div className="h-5 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto text-muted-foreground mb-3" size={32} />
            <p className="text-sm text-muted-foreground">No loads yet.</p>
            <Link href="/dashboard/shipper/post-load" className={buttonVariants({ size: 'sm' }) + ' mt-4'}>
              Post your first load
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((load) => (
              <Link
                key={load.id}
                href={`/dashboard/shipper/track/${load.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs font-mono text-muted-foreground w-24 shrink-0">{load.shortId}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {load.origin} → {load.destination}
                  </p>
                  <p className="text-xs text-muted-foreground">{load.cargoType} · {load.weight}t · {formatDate(load.deliveryDate)}</p>
                </div>
                <LoadStatusBadge status={load.status} />
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
