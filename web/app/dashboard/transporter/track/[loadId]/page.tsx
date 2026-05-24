'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin, Truck, User, Phone } from 'lucide-react';
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
  { key: 'AWAITING_CONFIRMATION',  label: 'Awaiting Delivery Confirmation' },
  { key: 'DELIVERED',              label: 'Delivered' },
] as const;

const STATUS_ACTIONS: Partial<Record<string, { label: string; next: string }>> = {
  ACCEPTED: { label: 'Mark as Picked Up',    next: 'PICKED_UP' },
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
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    );
  }

  if (!load) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Load not found.</p>
        <Link href="/dashboard/transporter/jobs" className={`${buttonVariants({ size: 'sm' })} mt-4 inline-flex`}>
          Back to Jobs
        </Link>
      </div>
    );
  }

  const stepIndex = TIMELINE_STEPS.findIndex((s) => s.key === load.status);
  const nextAction = STATUS_ACTIONS[load.status];

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
        <Link href="/dashboard/transporter/jobs" className="text-gray-400 hover:text-gray-700 transition-colors">
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

        {/* Left column — timeline + load details */}
        <div className="lg:col-span-3 space-y-5">

          {/* Status Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-5">Status Timeline</h3>
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
                        done
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
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

          {/* Load Details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Load Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-gray-500">Cargo Type</dt>
              <dd className="font-medium text-gray-900">{load.cargoType}</dd>
              <dt className="text-gray-500">Weight</dt>
              <dd className="font-medium text-gray-900">{load.weight} tonnes</dd>
              <dt className="text-gray-500">Required By</dt>
              <dd className="font-medium text-gray-900">{formatDate(load.deliveryDate)}</dd>
              {load.preferredVehicle && (
                <>
                  <dt className="text-gray-500">Vehicle Type</dt>
                  <dd className="font-medium text-gray-900">{load.preferredVehicle}</dd>
                </>
              )}
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

        {/* Right column — actions + shipper info */}
        <div className="lg:col-span-2 space-y-5">

          {/* Shipper info */}
          {load.shipper && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipper</h3>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                  <User size={16} className="text-[#1E3A8A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{load.shipper.company || load.shipper.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {load.shipper.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* USSD reminder */}
          <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={14} className="text-[#1E3A8A]" />
              <p className="text-xs font-semibold text-[#1E3A8A]">No Internet? Use USSD</p>
            </div>
            <p className="text-xs text-gray-600">Dial <strong className="font-mono">*384*7447#</strong> from any phone to update your status.</p>
          </div>

          {/* Status update action */}
          {nextAction && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Update Status</h3>
              <div>
                <label className="ff-label">Current Location <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                  placeholder="e.g. Nakuru bypass, 50km from Nairobi"
                  className="ff-input"
                />
              </div>
              <Button
                onClick={() => statusMut.mutate({ status: nextAction.next, note: locationNote || undefined })}
                disabled={statusMut.isPending}
                className="w-full"
              >
                {statusMut.isPending
                  ? <><Loader2 className="animate-spin" size={14} /> Updating...</>
                  : nextAction.label}
              </Button>
            </div>
          )}

          {load.status === 'IN_TRANSIT' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Report Delivery</h3>
              <p className="text-sm text-gray-500">Confirm the goods have been delivered to the destination.</p>
              <Button
                variant="success"
                onClick={() => deliverMut.mutate()}
                disabled={deliverMut.isPending}
                className="w-full"
              >
                {deliverMut.isPending
                  ? <><Loader2 className="animate-spin" size={14} /> Reporting...</>
                  : 'Report Delivered'}
              </Button>
            </div>
          )}

          {load.status === 'AWAITING_CONFIRMATION' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <strong>Waiting for confirmation</strong>
              <p className="text-xs mt-1">The shipper needs to confirm delivery. You&apos;ll be notified via SMS.</p>
            </div>
          )}

          {load.status === 'DELIVERED' && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <strong>✓ Delivery confirmed</strong>
              {load.rating && (
                <p className="mt-1">Your rating: <strong>{load.rating}/5 ★</strong></p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
