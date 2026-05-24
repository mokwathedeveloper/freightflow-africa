'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Loader2, Star, AlertTriangle, X, User, Phone, Truck } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { useToastStore } from '@/store/toast.store';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';

const TIMELINE_STEPS = [
  { key: 'POSTED',                 label: 'Load Posted' },
  { key: 'ACCEPTED',               label: 'Accepted by Transporter' },
  { key: 'PICKED_UP',              label: 'Cargo Picked Up' },
  { key: 'IN_TRANSIT',             label: 'In Transit' },
  { key: 'AWAITING_CONFIRMATION',  label: 'Awaiting Your Confirmation' },
  { key: 'DELIVERED',              label: 'Delivered' },
] as const;

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
    mutationFn: (description: string) => api.post(`/loads/${loadId}/dispute`, { description }),
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
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  if (!load) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Load not found.</p>
        <Link href="/dashboard/shipper/shipments" className={`${buttonVariants({ size: 'sm' })} mt-4 inline-flex`}>
          Back to Shipments
        </Link>
      </div>
    );
  }

  const stepIndex = TIMELINE_STEPS.findIndex((s) => s.key === load.status);

  const timestamps: Record<string, string | undefined> = {
    POSTED:                load.createdAt,
    ACCEPTED:              load.acceptedAt,
    PICKED_UP:             load.pickedUpAt,
    IN_TRANSIT:            load.inTransitAt,
    AWAITING_CONFIRMATION: load.deliveredAt,
    DELIVERED:             load.confirmedAt,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/shipper/shipments" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-gray-900">{load.shortId}</h2>
              <LoadStatusBadge status={load.status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{load.origin} → {load.destination}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left column */}
        <div className="lg:col-span-3 space-y-5">

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-5">Shipment Timeline</h3>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => {
                const done = i <= stepIndex;
                const current = i === stepIndex;
                const ts = timestamps[step.key];
                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                        done ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                      )}>
                        {done ? '✓' : i + 1}
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={cn('w-0.5 h-8', done ? 'bg-[#1E3A8A]' : 'bg-gray-200')} />
                      )}
                    </div>
                    <div className="pb-4 pt-1">
                      <p className={cn(
                        'text-sm font-medium',
                        current ? 'text-[#1E3A8A]' : done ? 'text-gray-900' : 'text-gray-400'
                      )}>
                        {step.label}
                        {current && <span className="ml-2 text-xs bg-[#1E3A8A]/10 text-[#1E3A8A] px-1.5 py-0.5 rounded-full">Current</span>}
                      </p>
                      {ts && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(ts)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Load details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Load Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-gray-500">Cargo Type</dt>
              <dd className="font-medium text-gray-900">{load.cargoType}</dd>
              <dt className="text-gray-500">Weight</dt>
              <dd className="font-medium text-gray-900">{load.weight} tonnes</dd>
              <dt className="text-gray-500">Required By</dt>
              <dd className="font-medium text-gray-900">{formatDate(load.deliveryDate)}</dd>
              {load.lastLocation && (
                <>
                  <dt className="text-gray-500 flex items-center gap-1"><MapPin size={11} /> Last Location</dt>
                  <dd className="font-medium text-gray-900">{load.lastLocation}</dd>
                </>
              )}
            </dl>
            {load.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 italic">{load.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Transporter info */}
          {load.transporter ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Assigned Transporter</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center font-bold text-[#1E3A8A]">
                  {load.transporter.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{load.transporter.name}</p>
                  <p className="text-xs text-gray-500">★ {load.transporter.rating.toFixed(1)} ({load.transporter.ratingCount} trips)</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p className="flex items-center gap-1.5"><Truck size={11} /> {load.transporter.vehicleType} · {load.transporter.numberPlate}</p>
                <p className="flex items-center gap-1.5"><Phone size={11} /> {load.transporter.phone}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 text-center">
              <User size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Waiting for a transporter to accept this load</p>
            </div>
          )}

          {/* Confirm delivery */}
          {load.status === 'AWAITING_CONFIRMATION' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Confirm Delivery</h3>
              <p className="text-sm text-gray-500">Rate the transporter to complete the delivery.</p>
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
                      size={26}
                      className={cn(
                        'transition-colors',
                        s <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      )}
                    />
                  </button>
                ))}
                {rating > 0 && <span className="ml-1 text-sm text-gray-500 self-center">{rating}/5</span>}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="success"
                  onClick={() => confirmMut.mutate(rating || 5)}
                  disabled={confirmMut.isPending}
                  className="flex-1"
                >
                  {confirmMut.isPending ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Delivery'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDisputeOpen(true)}
                  size="sm"
                >
                  <AlertTriangle size={13} /> Dispute
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

          {load.status === 'DELIVERED' && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <strong>✓ Delivery confirmed</strong>
              {load.rating && <p className="mt-1">You rated this delivery: <strong>{load.rating}/5 ★</strong></p>}
            </div>
          )}

          {load.status === 'DISPUTED' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <strong>Dispute in progress</strong>
              <p className="text-xs mt-1">Our team will contact you shortly.</p>
            </div>
          )}
        </div>
      </div>

      {/* Dispute Modal */}
      {disputeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Raise a Dispute</h3>
              <button onClick={() => setDisputeOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500">Describe the issue with this delivery.</p>
            <textarea
              value={disputeText}
              onChange={(e) => setDisputeText(e.target.value)}
              placeholder="e.g. Goods arrived damaged, wrong items delivered..."
              rows={4}
              className="ff-input h-auto resize-none py-2.5"
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
