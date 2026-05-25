'use client';

import { use, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Loader2, MapPin, Truck, Phone,
  Clock, Package, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { useToastStore } from '@/store/toast.store';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import RouteMap from '@/components/tracking/RouteMap';
import ProgressTimeline, { type TimelineStep } from '@/components/tracking/ProgressTimeline';
import TrackingStatsBar from '@/components/tracking/TrackingStatsBar';
import { useCargoTracking } from '@/hooks/useCargoTracking';
import type { LoadStatus } from '@/types';

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'POSTED',                label: 'Load Posted' },
  { key: 'ACCEPTED',              label: 'Accepted by You' },
  { key: 'PICKED_UP',             label: 'Cargo Picked Up' },
  { key: 'IN_TRANSIT',            label: 'In Transit' },
  { key: 'AWAITING_CONFIRMATION', label: 'Awaiting Shipper Confirmation' },
  { key: 'DELIVERED',             label: 'Delivered' },
];

const STATUS_ACTIONS: Partial<Record<LoadStatus, { label: string; next: string }>> = {
  ACCEPTED:  { label: 'Mark as Picked Up',  next: 'PICKED_UP' },
  PICKED_UP: { label: 'Mark as In Transit', next: 'IN_TRANSIT' },
};

export default function TransporterTrackPage({ params }: { params: Promise<{ loadId: string }> }) {
  const { loadId } = use(params);
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [locationNote, setLocationNote] = useState('');

  const { load, isLoading, isRefreshing, lastUpdated, refetch } = useCargoTracking(loadId);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading load details">
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

  const timestamps: Record<string, string | undefined> = {
    POSTED:                load.createdAt,
    ACCEPTED:              load.acceptedAt,
    PICKED_UP:             load.pickedUpAt,
    IN_TRANSIT:            load.inTransitAt,
    AWAITING_CONFIRMATION: load.deliveredAt,
    DELIVERED:             load.confirmedAt,
  };

  const nextAction = STATUS_ACTIONS[load.status as LoadStatus];

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/transporter/jobs"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Back to jobs"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-gray-900">Load {load.shortId}</h2>
              <LoadStatusBadge status={load.status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {load.origin} → {load.destination}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {load.shipper && (
            <a
              href={`tel:${load.shipper.phone}`}
              className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5"
              aria-label={`Call shipper ${load.shipper.company || load.shipper.name}`}
            >
              <Phone size={13} /> Contact Shipper
            </a>
          )}
          {['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(load.status) && (
            <button
              onClick={() => addToast('info', 'Please contact support to report a route issue.')}
              className="btn-danger text-xs h-8 px-3 flex items-center gap-1.5"
              aria-label="Report a route issue"
            >
              <AlertTriangle size={13} /> Report Issue
            </button>
          )}
        </div>
      </div>

      {/* Live stats bar */}
      <TrackingStatsBar
        status={load.status}
        deliveryDate={load.deliveryDate}
        origin={load.origin}
        destination={load.destination}
        lastLocation={load.lastLocation}
        isRefreshing={isRefreshing}
        onRefresh={refetch}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left column ── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Load details */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Load Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <MapPin size={12} /> Origin
                </dt>
                <dd className="font-semibold text-gray-900">{load.origin}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <MapPin size={12} className="text-green-600" /> Destination
                </dt>
                <dd className="font-semibold text-gray-900">{load.destination}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <Clock size={12} /> Required By
                </dt>
                <dd className="font-medium text-gray-900">{formatDate(load.deliveryDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <Package size={12} /> Cargo
                </dt>
                <dd className="font-medium text-gray-900">{load.cargoType} · {load.weight}t</dd>
              </div>
              {load.preferredVehicle && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1.5">
                    <Truck size={12} /> Vehicle
                  </dt>
                  <dd className="font-medium text-gray-900">{load.preferredVehicle}</dd>
                </div>
              )}
              {load.lastLocation && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1.5">
                    <MapPin size={12} /> Last Seen
                  </dt>
                  <dd className="font-medium text-gray-900">{load.lastLocation}</dd>
                </div>
              )}
            </dl>
            {load.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Notes from shipper</p>
                <p className="text-sm text-gray-700 italic">{load.notes}</p>
              </div>
            )}
          </section>

          {/* Route map */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Route Tracking</h3>
            <RouteMap
              origin={load.origin}
              destination={load.destination}
              status={load.status}
              lastLocation={load.lastLocation}
              lastUpdated={lastUpdated}
              onRefresh={refetch}
              isRefreshing={isRefreshing}
            />
          </section>

          {/* Shipper card */}
          {load.shipper && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipper</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center font-bold text-[#1E3A8A]">
                  {(load.shipper.company?.trim() || load.shipper.name?.trim() || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {load.shipper.company || load.shipper.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{load.shipper.phone}</p>
                </div>
                <a
                  href={`tel:${load.shipper.phone}`}
                  className="text-[#1E3A8A] hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                  aria-label={`Call ${load.shipper.company || load.shipper.name}`}
                >
                  <Phone size={15} />
                </a>
              </div>
            </section>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-7 space-y-5">

          {/* Progress Journey */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-5">Progress Journey</h3>
            <ProgressTimeline
              steps={TIMELINE_STEPS}
              currentStatus={load.status}
              timestamps={timestamps}
              statusLogs={load.statusLogs}
              formatDateTime={formatDateTime}
            />
          </section>

          {/* Update status action */}
          {nextAction && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Update Status</h3>
              <div>
                <label className="ff-label" htmlFor="location-note">
                  Current Location{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="location-note"
                  value={locationNote}
                  onChange={(e) => setLocationNote(e.target.value)}
                  placeholder="e.g. Nakuru bypass, 50km from Nairobi"
                  className="ff-input"
                  aria-describedby="location-note-hint"
                />
                <p id="location-note-hint" className="text-xs text-gray-400 mt-1">
                  This will be visible to the shipper.
                </p>
              </div>
              <Button
                onClick={() =>
                  statusMut.mutate({ status: nextAction.next, note: locationNote || undefined })
                }
                disabled={statusMut.isPending}
                className="w-full"
              >
                {statusMut.isPending
                  ? <><Loader2 className="animate-spin" size={14} /> Updating...</>
                  : nextAction.label}
              </Button>
            </section>
          )}

          {/* Report Delivery */}
          {load.status === 'IN_TRANSIT' && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Report Delivery</h3>
              <p className="text-sm text-gray-500">
                Confirm the goods have been delivered to the destination.
              </p>
              <Button
                variant="success"
                onClick={() => deliverMut.mutate()}
                disabled={deliverMut.isPending}
                className="w-full"
              >
                {deliverMut.isPending
                  ? <><Loader2 className="animate-spin" size={14} /> Reporting...</>
                  : '✓ Report Delivered'}
              </Button>
            </section>
          )}

          {load.status === 'AWAITING_CONFIRMATION' && (
            <div
              className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700"
              role="status"
            >
              <strong>Waiting for shipper confirmation</strong>
              <p className="text-xs mt-1">
                You&apos;ll be notified via SMS once the shipper confirms.
              </p>
            </div>
          )}

          {load.status === 'DELIVERED' && (
            <div
              className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              role="status"
            >
              <strong>✓ Delivery confirmed by shipper</strong>
              {load.rating && (
                <p className="mt-1">Your rating: <strong>{load.rating}/5 ★</strong></p>
              )}
            </div>
          )}

          {/* USSD reminder */}
          <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Truck size={14} className="text-[#1E3A8A]" />
              <p className="text-xs font-semibold text-[#1E3A8A]">No Internet? Use USSD</p>
            </div>
            <p className="text-xs text-gray-600">
              Dial{' '}
              <strong className="font-mono">*384*7447#</strong>{' '}
              from any phone to update your delivery status without internet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
