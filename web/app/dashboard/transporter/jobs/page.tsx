'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Briefcase, ChevronRight } from 'lucide-react';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';

interface MyLoadsResponse {
  data: { loads: Load[]; total: number };
}

export default function JobsPage() {
  const { data, isLoading } = useQuery<MyLoadsResponse>({
    queryKey: ['transporter-jobs'],
    queryFn: () => api.get('/loads/my?limit=100').then((r) => r.data),
  });

  const loads = data?.data.loads ?? [];

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-lg font-semibold text-foreground">My Jobs</h2>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded flex-1" />
                <div className="h-5 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        ) : loads.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase className="mx-auto text-muted-foreground mb-3" size={32} />
            <p className="text-sm text-muted-foreground">No jobs yet. Accept a load to get started.</p>
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
                  href={`/dashboard/transporter/track/${load.id}`}
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
      <p className="text-xs text-muted-foreground">{loads.length} job{loads.length !== 1 ? 's' : ''}</p>
    </div>
  );
}
