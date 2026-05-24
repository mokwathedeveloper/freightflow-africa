'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { useToastStore } from '@/store/toast.store';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';

const TIMELINE_STEPS = ['POSTED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION', 'DELIVERED'] as const;

const STATUS_ACTIONS: Partial<Record<string, { label: string; next: string }>> = {
  ACCEPTED: { label: 'Mark as Picked Up', next: 'PICKED_UP' },
  PICKED_UP: { label: 'Mark as In Transit', next: 'IN_TRANSIT' },
};

export default function TransporterTrackPage({ params }: { params: Promise<{ loadId: string }> }) {
  const { loadId } = use(params);
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [locationNote, setLocationNote] = useState('');

  const { data, isLoading } = useQuery<{ data: Load }>({
    queryKey: ['load', loadId],
    queryFn: () => api.get(`/loads/${loadId}`).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const statusMut = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      api.patch(`/loads/${loadId}/status`, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['load', loadId] });
      qc.invalidateQueries({ queryKey: ['transporter-jobs'] });
      setLocationNote('');
      addToast('success', 'Status updated! Shipper notified via SMS.');
    },
    onError: () => addToast('error', 'Failed to update status.'),
  });

  const deliverMut = useMutation({
    mutationFn: () => api.post(`/loads/${loadId}/deliver`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['load', loadId] });
      qc.invalidateQueries({ queryKey: ['transporter-jobs'] });
      addToast('success', 'Delivery reported! Waiting for shipper confirmation.');
    },
    onError: () => addToast('error', 'Failed to report delivery.'),
  });

  const load = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (!load) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Load not found.</p>
        <Link href="/dashboard/transporter/jobs" className={buttonVariants({ size: 'sm' }) + ' mt-4'}>Back</Link>
      </div>
    );
  }

  const stepIndex = TIMELINE_STEPS.indexOf(load.status as typeof TIMELINE_STEPS[number]);
  const nextAction = STATUS_ACTIONS[load.status];

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/transporter/jobs" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">{load.shortId}</h2>
            <LoadStatusBadge status={load.status} />
          </div>
          <p className="text-xs text-muted-foreground">{load.origin} → {load.destination}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Status Timeline</h3>
        <div className="space-y-3">
          {TIMELINE_STEPS.map((step, i) => {
            const done = i <= stepIndex;
            const current = i === stepIndex;
            const timestamps: Record<string, string | undefined> = {
              POSTED: load.createdAt,
              ACCEPTED: load.acceptedAt,
              PICKED_UP: load.pickedUpAt,
              IN_TRANSIT: load.inTransitAt,
              AWAITING_CONFIRMATION: load.deliveredAt,
              DELIVERED: load.confirmedAt,
            };
            return (
              <div key={step} className="flex items-start gap-3">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  done ? 'bg-primary' : 'bg-muted border-2 border-border'
                )}>
                  {done && <span className="text-primary-foreground text-xs">✓</span>}
                </div>
                <div className={cn('text-sm', current ? 'font-semibold text-foreground' : done ? 'text-foreground' : 'text-muted-foreground')}>
                  <p>{step.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                  {timestamps[step] && <p className="text-xs text-muted-foreground">{formatDateTime(timestamps[step]!)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Load details */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Load Details</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Cargo</dt><dd className="font-medium">{load.cargoType}</dd>
          <dt className="text-muted-foreground">Weight</dt><dd className="font-medium">{load.weight}t</dd>
          <dt className="text-muted-foreground">Required by</dt><dd className="font-medium">{formatDate(load.deliveryDate)}</dd>
          {load.notes && <><dt className="text-muted-foreground">Notes</dt><dd className="font-medium">{load.notes}</dd></>}
          {load.lastLocation && (
            <><dt className="text-muted-foreground flex items-center gap-1"><MapPin size={12} />Last checkpoint</dt><dd className="font-medium">{load.lastLocation}</dd></>
          )}
        </dl>
      </div>

      {/* Shipper info */}
      {load.shipper && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Shipper</h3>
          <p className="text-sm font-medium text-foreground">{load.shipper.company || load.shipper.name}</p>
          <p className="text-xs text-muted-foreground">{load.shipper.phone}</p>
        </div>
      )}

      {/* Status update actions */}
      {nextAction && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Update Status</h3>
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">Current location (optional)</label>
            <input
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
              placeholder="e.g. Nakuru bypass, 50km from Nairobi"
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            onClick={() => statusMut.mutate({ status: nextAction.next, note: locationNote || undefined })}
            disabled={statusMut.isPending}
            className="w-full"
          >
            {statusMut.isPending ? <Loader2 className="animate-spin" size={14} /> : nextAction.label}
          </Button>
        </div>
      )}

      {load.status === 'IN_TRANSIT' && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Report Delivery</h3>
          <p className="text-sm text-muted-foreground">Confirm you have delivered the goods to the destination.</p>
          <Button
            onClick={() => deliverMut.mutate()}
            disabled={deliverMut.isPending}
            className="w-full"
          >
            {deliverMut.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Report Delivered'}
          </Button>
        </div>
      )}

      {load.status === 'AWAITING_CONFIRMATION' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Waiting for the shipper to confirm delivery. You&apos;ll be notified when they do.
        </div>
      )}

      {load.status === 'DELIVERED' && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          ✓ Delivery confirmed by shipper.
          {load.rating && (
            <p className="mt-1">Your rating for this job: <strong>{load.rating}/5 ★</strong></p>
          )}
        </div>
      )}
    </div>
  );
}
