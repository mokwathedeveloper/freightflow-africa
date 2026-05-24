'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package, ChevronRight, Search } from 'lucide-react';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Load, LoadStatus } from '@/types';

interface MyLoadsResponse {
  data: { loads: Load[]; total: number };
}

const FILTERS: { label: string; value: LoadStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Posted', value: 'POSTED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Awaiting', value: 'AWAITING_CONFIRMATION' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Disputed', value: 'DISPUTED' },
];

export default function ShipmentsPage() {
  const [filter, setFilter] = useState<LoadStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<MyLoadsResponse>({
    queryKey: ['shipper-loads'],
    queryFn: () => api.get('/loads/my?limit=100').then((r) => r.data),
  });

  const allLoads = data?.data.loads ?? [];
  const loads = allLoads
    .filter((l) => filter === 'ALL' || l.status === filter)
    .filter((l) =>
      !search ||
      l.shortId.toLowerCase().includes(search.toLowerCase()) ||
      l.origin.toLowerCase().includes(search.toLowerCase()) ||
      l.destination.toLowerCase().includes(search.toLowerCase()) ||
      l.cargoType.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="max-w-4xl space-y-4">
      <h2 className="text-lg font-semibold text-foreground">My Shipments</h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, city, cargo..."
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 h-9 rounded-lg text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded flex-1" />
                <div className="h-5 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        ) : loads.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto text-muted-foreground mb-3" size={32} />
            <p className="text-sm text-muted-foreground">No shipments found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_2fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-border text-xs font-medium text-muted-foreground">
              <span>Load ID</span>
              <span>Route</span>
              <span>Status</span>
              <span />
            </div>
            <div className="divide-y divide-border">
              {loads.map((load) => (
                <Link
                  key={load.id}
                  href={`/dashboard/shipper/track/${load.id}`}
                  className="grid grid-cols-[1fr_2fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs font-mono text-muted-foreground">{load.shortId}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground truncate">{load.origin} → {load.destination}</p>
                    <p className="text-xs text-muted-foreground">{load.cargoType} · {load.weight}t · {formatDate(load.deliveryDate)}</p>
                  </div>
                  <LoadStatusBadge status={load.status} />
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{loads.length} shipment{loads.length !== 1 ? 's' : ''} shown</p>
    </div>
  );
}
