'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, MapPin, Truck, Phone, Clock, Package, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { useToastStore } from '@/store/toast.store';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';

const TIMELINE_STEPS = [
  { key: 'POSTED',                 label: 'Load Posted',                     short: 'Posted' },
  { key: 'ACCEPTED',               label: 'Accepted by You',                 short: 'Accepted' },
  { key: 'PICKED_UP',              label: 'Cargo Picked Up',                 short: 'Picked Up' },
  { key: 'IN_TRANSIT',             label: 'In Transit',                      short: 'In Transit' },
  { key: 'AWAITING_CONFIRMATION',  label: 'Awaiting Shipper Confirmation',   short: 'Awaiting' },
  { key: 'DELIVERED',              label: 'Delivered',                       short: 'Delivered' },
] as const;

const STATUS_ACTIONS: Partial<Record<string, { label: string; next: string }>> = {
  ACCEPTED:  { label: 'Mark as Picked Up',    next: 'PICKED_UP' },
  PICKED_UP: { label: 'Mark as In Transit',   next: 'IN_TRANSIT' },
};

// ── Route map SVG ─────────────────────────────────────────────────────────────
function RouteMap({ origin, destination, status }: { origin: string; destination: string; status: string }) {
  const progress = {
    POSTED: 0, ACCEPTED: 0.1, PICKED_UP: 0.25, IN_TRANSIT: 0.6,
    AWAITING_CONFIRMATION: 0.9, DELIVERED: 1,
  }[status] ?? 0;

  const W = 360, H = 200;
  const ox = 40, oy = 160;
  const dx = 320, dy = 40;
  const mx = (ox + dx) / 2, my = Math.min(oy, dy) - 50;
  const pts = [
    [ox, oy], [ox + (mx - ox) * 0.33, oy + (my - oy) * 0.33 + 10],
    [mx, my], [mx + (dx - mx) * 0.5, my + (dy - my) * 0.5 - 10], [dx, dy],
  ];
  const pathD = `M ${pts[0][0]} ${pts[0][1]} C ${pts[1][0]} ${pts[1][1]}, ${pts[2][0]} ${pts[2][1]}, ${pts[2][0]} ${pts[2][1]} S ${pts[3][0]} ${pts[3][1]}, ${pts[4][0]} ${pts[4][1]}`;

  const progX = ox + (dx - ox) * progress;
  const progY = oy + (dy - oy) * progress - Math.sin(Math.PI * progress) * 60;

  return (
    <div className="bg-[#F0F4FB] rounded-xl overflow-hidden border border-gray-200" style={{ height: 220 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ maxHeight: 220 }}>
        {/* Grid lines */}
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#E2E8F0" strokeWidth="0.5" />
        ))}
        {[60, 120, 180, 240, 300].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2={H} stroke="#E2E8F0" strokeWidth="0.5" />
        ))}

        {/* Route shadow */}
        <path d={pathD} fill="none" stroke="#CBD5E1" strokeWidth="4" strokeDasharray="8 4" strokeLinecap="round" />

        {/* Route completed portion */}
        {progress > 0 && (
          <path d={pathD} fill="none" stroke="#1E3A8A" strokeWidth="3.5"
            strokeDasharray={`${progress * 600} 600`} strokeLinecap="round" />
        )}

        {/* Origin dot */}
        <circle cx={ox} cy={oy} r="8" fill="#1E3A8A" />
        <circle cx={ox} cy={oy} r="4" fill="white" />

        {/* Destination dot */}
        <circle cx={dx} cy={dy} r="8" fill={progress >= 1 ? '#16A34A' : '#9CA3AF'} />
        <circle cx={dx} cy={dy} r="4" fill="white" />

        {/* Truck position */}
        {progress > 0 && progress < 1 && (
          <>
            <circle cx={progX} cy={progY} r="12" fill="#1E3A8A" opacity="0.15" />
            <circle cx={progX} cy={progY} r="8" fill="#1E3A8A" />
            <text x={progX} y={progY + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">🚛</text>
          </>
        )}

        {/* Origin label */}
        <text x={ox} y={oy + 18} textAnchor="middle" fill="#1E3A8A" fontSize="10" fontWeight="600">{origin}</text>

        {/* Destination label */}
        <text x={dx} y={dy - 14} textAnchor="middle" fill={progress >= 1 ? '#16A34A' : '#6B7280'} fontSize="10" fontWeight="600">{destination}</text>

        {/* Progress % */}
        <text x={W / 2} y={H - 6} textAnchor="middle" fill="#9CA3AF" fontSize="9">
          {Math.round(progress * 100)}% of route completed
        </text>
      </svg>
    </div>
  );
}

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

  const load = data?.data;

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
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/transporter/jobs" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-gray-900">Load {load.shortId}</h2>
              <LoadStatusBadge status={load.status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{load.origin} → {load.destination}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {load.shipper && (
            <a
              href={`tel:${load.shipper.phone}`}
              className="btn-secondary text-xs h-8 px-3 flex items-center gap-1.5"
            >
              <Phone size={13} /> Contact Shipper
            </a>
          )}
          {['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT'].includes(load.status) && (
            <button
              onClick={() => addToast('info', 'Please contact support to report a route issue.')}
              className="btn-danger text-xs h-8 px-3 flex items-center gap-1.5"
            >
              <AlertTriangle size={13} /> Report Issue
            </button>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left column — load details + route map + shipper card */}
        <div className="lg:col-span-5 space-y-5">

          {/* Load details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Load Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5"><MapPin size={12} /> Origin</dt>
                <dd className="font-semibold text-gray-900">{load.origin}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5"><MapPin size={12} className="text-green-600" /> Destination</dt>
                <dd className="font-semibold text-gray-900">{load.destination}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5"><Clock size={12} /> Required By</dt>
                <dd className="font-medium text-gray-900">{formatDate(load.deliveryDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1.5"><Package size={12} /> Cargo</dt>
                <dd className="font-medium text-gray-900">{load.cargoType} · {load.weight}t</dd>
              </div>
              {load.preferredVehicle && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1.5"><Truck size={12} /> Vehicle</dt>
                  <dd className="font-medium text-gray-900">{load.preferredVehicle}</dd>
                </div>
              )}
              {load.lastLocation && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1.5"><MapPin size={12} /> Last Seen</dt>
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
          </div>

          {/* Route map */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Route Tracking</h3>
            <RouteMap origin={load.origin} destination={load.destination} status={load.status} />
          </div>

          {/* Shipper card */}
          {load.shipper && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipper</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center font-bold text-[#1E3A8A]">
                  {(load.shipper.company || load.shipper.name).charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{load.shipper.company || load.shipper.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{load.shipper.phone}</p>
                </div>
                <a href={`tel:${load.shipper.phone}`} className="text-[#1E3A8A] hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
                  <Phone size={15} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right column — progress timeline + actions */}
        <div className="lg:col-span-7 space-y-5">

          {/* Progress Journey */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-5">Progress Journey</h3>

            {/* Horizontal progress bar */}
            <div className="relative mb-6">
              <div className="h-1 bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-[#1E3A8A] rounded-full transition-all duration-500"
                  style={{ width: `${(stepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                {TIMELINE_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-3 h-3 rounded-full border-2 -mt-5 relative z-10',
                      i <= stepIndex
                        ? 'bg-[#1E3A8A] border-[#1E3A8A]'
                        : 'bg-white border-gray-300'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Vertical timeline steps */}
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => {
                const done = i <= stepIndex;
                const current = i === stepIndex;
                const ts = timestamps[step.key];
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border-2',
                        done
                          ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                          : current
                            ? 'bg-white border-[#1E3A8A] text-[#1E3A8A]'
                            : 'bg-white border-gray-200 text-gray-300'
                      )}>
                        {done ? '✓' : i + 1}
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={cn('w-0.5 flex-1 min-h-[28px]', i < stepIndex ? 'bg-[#1E3A8A]' : 'bg-gray-100')} />
                      )}
                    </div>
                    <div className="pb-5 pt-1 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'text-sm font-medium',
                          current ? 'text-[#1E3A8A]' : done ? 'text-gray-900' : 'text-gray-400'
                        )}>
                          {step.label}
                        </p>
                        {current && (
                          <span className="text-xs bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      {ts && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(ts)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status update action */}
          {nextAction && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
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

          {/* Report Delivery */}
          {load.status === 'IN_TRANSIT' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
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
                  : '✓ Report Delivered'}
              </Button>
            </div>
          )}

          {/* Awaiting confirmation */}
          {load.status === 'AWAITING_CONFIRMATION' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <strong>Waiting for shipper confirmation</strong>
              <p className="text-xs mt-1">The shipper needs to confirm delivery. You&apos;ll be notified via SMS once confirmed.</p>
            </div>
          )}

          {/* Delivered */}
          {load.status === 'DELIVERED' && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
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
              Dial <strong className="font-mono">*384*7447#</strong> from any phone to update your delivery status without internet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
