'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Loader2, Star, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { useToastStore } from '@/store/toast.store';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';

const TIMELINE_STEPS = ['POSTED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION', 'DELIVERED'] as const;

export default function ShipperTrackPage({ params }: { params: Promise<{ loadId: string }> }) {
  const { loadId } = use(params);
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeText, setDisputeText] = useState('');

  const { data, isLoading } = useQuery<{ data: Load }>({
    queryKey: ['load', loadId],
    queryFn: () => api.get(`/loads/${loadId}`).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const load = data?.data;

  const confirmMut = useMutation({
    mutationFn: (stars: number) => api.post(`/loads/${loadId}/confirm`, { rating: stars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['load', loadId] });
      qc.invalidateQueries({ queryKey: ['shipper-loads'] });
      addToast('success', 'Delivery confirmed! Thank you for your rating.');
    },
    onError: () => addToast('error', 'Failed to confirm delivery.'),
  });

  const disputeMut = useMutation({
    mutationFn: (description: string) =>
      api.post(`/loads/${loadId}/dispute`, { description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['load', loadId] });
      setDisputeOpen(false);
      addToast('info', 'Dispute raised. Our team will review it shortly.');
    },
    onError: () => addToast('error', 'Failed to raise dispute.'),
  });

  const cancelMut = useMutation({
    mutationFn: () => api.post(`/loads/${loadId}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['load', loadId] });
      qc.invalidateQueries({ queryKey: ['shipper-loads'] });
      addToast('info', 'Load cancelled.');
    },
    onError: () => addToast('error', 'Failed to cancel load.'),
  });

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
        <Link href="/dashboard/shipper/shipments" className={buttonVariants({ size: 'sm' }) + ' mt-4'}>Back</Link>
      </div>
    );
  }

  const stepIndex = TIMELINE_STEPS.indexOf(load.status as typeof TIMELINE_STEPS[number]);

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/shipper/shipments" className="text-muted-foreground hover:text-foreground">
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
          {load.notes && <><dt className="text-muted-foreground">Notes</dt><dd className="font-medium col-span-1">{load.notes}</dd></>}
          {load.lastLocation && (
            <><dt className="text-muted-foreground flex items-center gap-1"><MapPin size={12} />Last seen</dt><dd className="font-medium">{load.lastLocation}</dd></>
          )}
        </dl>
      </div>

      {/* Transporter info */}
      {load.transporter && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Assigned Transporter</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {load.transporter.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{load.transporter.name}</p>
              <p className="text-xs text-muted-foreground">{load.transporter.vehicleType} · {load.transporter.numberPlate}</p>
              <p className="text-xs text-muted-foreground">★ {load.transporter.rating.toFixed(1)} ({load.transporter.ratingCount} trips)</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {load.status === 'AWAITING_CONFIRMATION' && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Confirm Delivery</h3>
          <p className="text-sm text-muted-foreground">Rate the transporter to complete the delivery.</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(s)}
                className="p-1"
              >
                <Star
                  size={28}
                  className={cn(
                    'transition-colors',
                    s <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
                  )}
                />
              </button>
            ))}
            {rating > 0 && <span className="ml-2 text-sm text-muted-foreground self-center">{rating}/5</span>}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => confirmMut.mutate(rating || 5)}
              disabled={confirmMut.isPending}
              className="flex-1"
            >
              {confirmMut.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Delivery'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDisputeOpen(true)}
              className="gap-1"
            >
              <AlertTriangle size={14} /> Dispute
            </Button>
          </div>
        </div>
      )}

      {load.status === 'POSTED' && (
        <Button
          variant="destructive"
          disabled={cancelMut.isPending}
          onClick={() => cancelMut.mutate()}
          className="w-full"
        >
          {cancelMut.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Cancel Load'}
        </Button>
      )}

      {/* Dispute modal */}
      {disputeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Raise a Dispute</h3>
              <button onClick={() => setDisputeOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">Describe the issue with this delivery.</p>
            <textarea
              value={disputeText}
              onChange={(e) => setDisputeText(e.target.value)}
              placeholder="e.g. Goods arrived damaged, wrong items delivered..."
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDisputeOpen(false)} className="flex-1">Cancel</Button>
              <Button
                variant="destructive"
                disabled={!disputeText.trim() || disputeMut.isPending}
                onClick={() => disputeMut.mutate(disputeText.trim())}
                className="flex-1"
              >
                {disputeMut.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Submit Dispute'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
