'use client';

import { use, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Loader2, Star, AlertTriangle, X,
  Phone, Truck, Clock, Package, MapPin,
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

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'POSTED',                label: 'Load Posted' },
  { key: 'ACCEPTED',              label: 'Accepted by Transporter' },
  { key: 'PICKED_UP',             label: 'Cargo Picked Up' },
  { key: 'IN_TRANSIT',            label: 'In Transit' },
  { key: 'AWAITING_CONFIRMATION', label: 'Awaiting Your Confirmation' },
  { key: 'DELIVERED',             label: 'Delivered' },
];

export default function ShipperTrackPage({ params }: { params: Promise<{ loadId: string }> }) {
  const { loadId } = use(params);
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [rating,       setRating]       = useState(0);
  const [hoverRating,  setHoverRating]  = useState(0);
  const [disputeOpen,  setDisputeOpen]  = useState(false);
  const [disputeText,  setDisputeText]  = useState('');

  const { load, isLoading, isRefreshing, lastUpdated, refetch } = useCargoTracking(loadId);

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
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading shipment">
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

  const timestamps: Record<string, string | undefined> = {
    POSTED:                load.createdAt,
    ACCEPTED:              load.acceptedAt,
    PICKED_UP:             load.pickedUpAt,
    IN_TRANSIT:            load.inTransitAt,
    AWAITING_CONFIRMATION: load.deliveredAt,
    DELIVERED:             load.confirmedAt,
  };

  const canDispute = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION'].includes(load.status);

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Breadcrumb + action buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/shipper/shipments"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Back to shipments"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-semibold text-gray-900">
                Shipment {load.shortId}
              </h2>
              <LoadStatusBadge status={load.status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {load.origin} → {load.destination}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {load.transporter && (
            <a
              href={`tel:${load.transporter.phone}`}
              className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5"
              aria-label={`Call transporter ${load.transporter.name}`}
            >
              <Phone size={13} /> Contact Transporter
            </a>
          )}
          {canDispute && (
            <button
              onClick={() => setDisputeOpen(true)}
              className="btn-danger text-xs h-8 px-3 flex items-center gap-1.5"
              aria-label="Report an issue with this shipment"
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

          {/* Shipment details */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Shipment Details</h3>
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
                  <Clock size={12} /> ETA
                </dt>
                <dd className="font-medium text-gray-900">{formatDate(load.deliveryDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5">
                  <Package size={12} /> Cargo
                </dt>
                <dd className="font-medium text-gray-900">
                  {load.cargoType} · {load.weight}t
                </dd>
              </div>
              {load.lastLocation && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1.5">
                    <Truck size={12} /> Last Seen
                  </dt>
                  <dd className="font-medium text-gray-900">{load.lastLocation}</dd>
                </div>
              )}
            </dl>
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

          {/* Assigned transporter */}
          {load.transporter && (
            <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Assigned Transporter</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center font-bold text-[#1E3A8A]">
                  {load.transporter.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {load.transporter.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <Truck size={10} className="inline mr-1" />
                    {load.transporter.vehicleType} · {load.transporter.numberPlate}
                  </p>
                  <p className="text-xs text-amber-500 mt-0.5">
                    ★ {load.transporter.rating.toFixed(1)} ({load.transporter.ratingCount} trips)
                  </p>
                </div>
                <a
                  href={`tel:${load.transporter.phone}`}
                  className="text-[#1E3A8A] hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                  aria-label={`Call ${load.transporter.name}`}
                >
                  <Phone size={15} />
                </a>
              </div>
            </section>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-7 space-y-5">

          {/* Progress journey */}
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

          {/* Confirm delivery */}
          {load.status === 'AWAITING_CONFIRMATION' && (
            <section
              className="bg-white rounded-xl border border-[#1E3A8A]/20 shadow-sm p-5 space-y-4"
              aria-label="Confirm delivery"
            >
              <h3 className="text-sm font-semibold text-gray-900">Confirm Delivery</h3>
              <p className="text-sm text-gray-500">
                The transporter has reported delivery. Please confirm and rate the service.
              </p>
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Rate the transporter</p>
                <div className="flex gap-1" role="group" aria-label="Star rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      aria-label={`Rate ${s} out of 5 stars`}
                      className="p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
                    >
                      <Star
                        size={28}
                        className={cn(
                          'transition-colors',
                          s <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200',
                        )}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-500 self-center">{rating}/5</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="success"
                  onClick={() => confirmMut.mutate(rating)}
                  disabled={confirmMut.isPending || rating === 0}
                  className="flex-1"
                  aria-label="Confirm delivery"
                >
                  {confirmMut.isPending
                    ? <Loader2 className="animate-spin" size={14} />
                    : '✓ Confirm Delivery'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDisputeOpen(true)}
                  size="sm"
                  aria-label="Dispute this delivery"
                >
                  <AlertTriangle size={13} /> Dispute
                </Button>
              </div>
            </section>
          )}

          {load.status === 'POSTED' && (
            <Button
              variant="destructive"
              disabled={cancelMut.isPending}
              onClick={() => cancelMut.mutate()}
              className="w-full"
            >
              {cancelMut.isPending
                ? <Loader2 className="animate-spin" size={14} />
                : 'Cancel Load'}
            </Button>
          )}

          {load.status === 'DELIVERED' && (
            <div
              className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              role="status"
            >
              <strong>✓ Delivery confirmed</strong>
              {load.rating && (
                <p className="mt-1">Your rating: <strong>{load.rating}/5 ★</strong></p>
              )}
            </div>
          )}

          {load.status === 'DISPUTED' && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              role="alert"
            >
              <strong>Dispute in progress</strong>
              <p className="text-xs mt-1">
                Our team will contact you shortly to resolve the issue.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Issue Modal */}
      {disputeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispute-modal-title"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 id="dispute-modal-title" className="font-semibold text-gray-900">
                Report an Issue
              </h3>
              <button
                onClick={() => setDisputeOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500">Describe the issue with this delivery.</p>
            <textarea
              value={disputeText}
              onChange={(e) => setDisputeText(e.target.value)}
              placeholder="e.g. Goods arrived damaged, wrong items delivered, late delivery..."
              rows={4}
              className="ff-input h-auto resize-none py-2.5"
              aria-label="Issue description"
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDisputeOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!disputeText.trim() || disputeMut.isPending}
                onClick={() => disputeMut.mutate(disputeText.trim())}
                className="flex-1"
              >
                {disputeMut.isPending
                  ? <Loader2 className="animate-spin" size={14} />
                  : 'Submit Report'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
