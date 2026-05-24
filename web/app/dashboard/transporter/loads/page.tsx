'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Weight, Calendar, Loader2, Package, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/store/toast.store';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';
import { KENYAN_CITIES, CARGO_TYPES } from '@/constants';

interface LoadsResponse {
  data: { loads: Load[]; total: number; page: number; pages: number };
}

export default function BrowseLoadsPage() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('');

  const { data, isLoading, refetch } = useQuery<LoadsResponse>({
    queryKey: ['available-loads', origin, destination, cargoType],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (origin) params.set('origin', origin);
      if (destination) params.set('destination', destination);
      if (cargoType) params.set('cargoType', cargoType);
      return api.get(`/loads?${params}`).then((r) => r.data);
    },
  });

  const acceptMut = useMutation({
    mutationFn: (loadId: string) => api.post(`/loads/${loadId}/accept`),
    onMutate: (id) => setAcceptingId(id),
    onSuccess: (_, loadId) => {
      qc.invalidateQueries({ queryKey: ['available-loads'] });
      qc.invalidateQueries({ queryKey: ['transporter-jobs'] });
      addToast('success', 'Load accepted! The shipper has been notified via SMS.');
      setAcceptingId(null);
    },
    onError: () => {
      addToast('error', 'Could not accept this load — it may have already been taken.');
      setAcceptingId(null);
      refetch();
    },
  });

  const loads = data?.data.loads ?? [];

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Browse Available Loads</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Filter loads that match your route and vehicle.</p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className={sel}
        >
          <option value="">Any origin</option>
          {KENYAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className={sel}
        >
          <option value="">Any destination</option>
          {KENYAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={cargoType}
          onChange={(e) => setCargoType(e.target.value)}
          className={sel}
        >
          <option value="">Any cargo</option>
          {CARGO_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Load cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded w-32 ml-auto" />
            </div>
          ))}
        </div>
      ) : loads.length === 0 ? (
        <div className="bg-card rounded-xl border border-border py-16 text-center">
          <Package className="mx-auto text-muted-foreground mb-3" size={32} />
          <p className="text-sm text-muted-foreground">No loads available matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loads.map((load) => (
            <LoadCard
              key={load.id}
              load={load}
              onAccept={() => acceptMut.mutate(load.id)}
              accepting={acceptingId === load.id}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{loads.length} load{loads.length !== 1 ? 's' : ''} available</p>
    </div>
  );
}

function LoadCard({ load, onAccept, accepting }: { load: Load; onAccept: () => void; accepting: boolean }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-primary shrink-0" />
            <span className="font-semibold text-foreground text-sm">{load.origin} → {load.destination}</span>
          </div>
          {load.shipper && (
            <p className="text-xs text-muted-foreground mt-0.5 pl-5">
              by {load.shipper.company || load.shipper.name}
            </p>
          )}
        </div>
        <span className="text-xs font-mono text-muted-foreground shrink-0">{load.shortId}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground pl-0">
        <span className="flex items-center gap-1"><Weight size={12} />{load.weight}t</span>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-muted rounded-full">{load.cargoType}</span>
        <span className="flex items-center gap-1"><Calendar size={12} />By {formatDate(load.deliveryDate)}</span>
      </div>

      {load.notes && (
        <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">{load.notes}</p>
      )}

      <div className="flex items-center justify-end pt-1">
        <Button
          size="sm"
          onClick={onAccept}
          disabled={accepting}
          className="gap-1.5"
        >
          {accepting ? <Loader2 className="animate-spin" size={13} /> : <ChevronRight size={13} />}
          {accepting ? 'Accepting...' : 'Accept Load'}
        </Button>
      </div>
    </div>
  );
}

const sel = cn(
  'h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
);
