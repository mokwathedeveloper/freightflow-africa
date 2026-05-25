'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Briefcase, ChevronRight, MapPin, Loader2, X,
  CheckCircle2, Truck, PackageCheck,
} from 'lucide-react';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { Button } from '@/components/ui/button';
import { formatDate, formatDateTime, cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast.store';
import api from '@/lib/api';
import type { Load, LoadStatus } from '@/types';
import DataTable, { Column } from '@/components/Table/DataTable';

interface MyLoadsResponse {
  data: { loads: Load[]; total: number };
}

const FILTER_TABS: { label: string; value: string }[] = [
  { label: 'All Jobs',   value: 'ALL' },
  { label: 'Active',     value: 'ACTIVE' },
  { label: 'Delivered',  value: 'DELIVERED' },
  { label: 'Cancelled',  value: 'CANCELLED' },
];

const ACTIVE_STATUSES: LoadStatus[] = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION'];

// Status update options available for each current status
const NEXT_STATUS: Partial<Record<LoadStatus, { label: string; next: string; icon: React.ElementType; color: string }>> = {
  ACCEPTED:  { label: 'Mark as Picked Up',    next: 'PICKED_UP',  icon: Truck,        color: 'bg-blue-600 hover:bg-blue-700' },
  PICKED_UP: { label: 'Mark as In Transit',   next: 'IN_TRANSIT', icon: MapPin,       color: 'bg-amber-600 hover:bg-amber-700' },
  IN_TRANSIT:{ label: 'Report Delivered',      next: 'DELIVER',    icon: PackageCheck, color: 'bg-green-600 hover:bg-green-700' },
};

interface UpdateModalProps {
  load: Load;
  onClose: () => void;
}

function UpdateStatusModal({ load, onClose }: UpdateModalProps) {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [locationNote, setLocationNote] = useState('');

  const action = NEXT_STATUS[load.status as LoadStatus];

  const statusMut = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      status === 'DELIVER'
        ? api.post(`/loads/${load.id}/deliver`)
        : api.patch(`/loads/${load.id}/status`, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transporter-jobs'] });
      addToast('success',
        action?.next === 'DELIVER'
          ? 'Delivery reported! Waiting for shipper confirmation.'
          : 'Status updated! Shipper notified via SMS.'
      );
      onClose();
    },
    onError: () => addToast('error', 'Failed to update status. Please try again.'),
  });

  if (!action) return null;
  const Icon = action.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md">
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900">Update Status</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Load <span className="font-mono">{load.shortId}</span> · {load.origin} → {load.destination}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Current status */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-500">Current status</span>
            <LoadStatusBadge status={load.status} />
          </div>

          {/* Location note (only for non-deliver actions) */}
          {action.next !== 'DELIVER' && (
            <div className="mb-4">
              <label className="ff-label">
                Current Location <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                value={locationNote}
                onChange={(e) => setLocationNote(e.target.value)}
                placeholder="e.g. Nakuru bypass, 50km from Nairobi"
                className="ff-input"
              />
              <p className="text-xs text-gray-400 mt-1">
                Helps the shipper know exactly where their cargo is.
              </p>
            </div>
          )}

          {/* Deliver confirmation */}
          {action.next === 'DELIVER' && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <p className="font-semibold mb-1">Confirm goods delivered?</p>
              <p className="text-xs text-green-700 leading-relaxed">
                This will notify the shipper to confirm delivery. Once confirmed, your job is complete.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={statusMut.isPending}>
            Cancel
          </Button>
          <button
            onClick={() => statusMut.mutate({ status: action.next, note: locationNote || undefined })}
            disabled={statusMut.isPending}
            className={cn(
              'flex-1 h-10 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50',
              action.color
            )}
          >
            {statusMut.isPending
              ? <><Loader2 className="animate-spin" size={14} /> Updating…</>
              : <><Icon size={14} /> {action.label}</>}
          </button>
        </div>

        {/* USSD reminder */}
        <div className="mx-5 mb-5 rounded-lg bg-[#1E3A8A]/5 border border-[#1E3A8A]/15 px-4 py-3">
          <p className="text-xs text-[#1E3A8A] font-medium">No internet? Use USSD</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Dial <strong className="font-mono">*384*7447#</strong> from any phone to update status.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [modalLoad, setModalLoad] = useState<Load | null>(null);

  const { data, isLoading } = useQuery<MyLoadsResponse>({
    queryKey: ['transporter-jobs'],
    queryFn: () => api.get('/loads/my?limit=100').then((r) => r.data),
  });

  const allLoads = data?.data.loads ?? [];
  const loads = allLoads.filter((l) => {
    if (filter === 'ACTIVE')    return ACTIVE_STATUSES.includes(l.status as LoadStatus);
    if (filter === 'DELIVERED') return l.status === 'DELIVERED';
    if (filter === 'CANCELLED') return l.status === 'CANCELLED';
    return true;
  });

  const activeCount = allLoads.filter((l) => ACTIVE_STATUSES.includes(l.status as LoadStatus)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Jobs</h2>
          <p className="text-sm text-gray-500 mt-0.5">All accepted loads and their delivery status</p>
        </div>
        {activeCount > 0 && (
          <span className="text-xs font-semibold bg-[#1E3A8A] text-white rounded-full px-3 py-1">
            {activeCount} active
          </span>
        )}
      </div>

      {/* ── Filter tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTER_TABS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 h-8 rounded-lg text-xs font-medium transition-colors',
              filter === f.value
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            )}
          >
            {f.label}
            {f.value === 'ACTIVE' && activeCount > 0 && (
              <span className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                filter === 'ACTIVE' ? 'bg-white/30 text-white' : 'bg-[#1E3A8A]/10 text-[#1E3A8A]'
              )}>
                {activeCount}
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{loads.length} job{loads.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-3 bg-gray-100 rounded flex-1" />
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-5 bg-gray-100 rounded w-20" />
                <div className="h-8 bg-gray-100 rounded w-28" />
              </div>
            ))}
          </div>
        ) : loads.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
              <Briefcase size={26} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No active jobs</p>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              Browse the marketplace to accept a load and start earning.
            </p>
            <Link
              href="/dashboard/transporter/loads"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#1E3A8A] hover:underline"
            >
              <CheckCircle2 size={13} /> Browse Available Loads
            </Link>
          </div>
        ) : (
          <DataTable<Load>
            columns={[
              {
                key: 'shortId',
                header: 'Load ID',
                render: (_, l) => (
                  <span className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                    {l.shortId}
                  </span>
                ),
              },
              {
                key: 'origin',
                header: 'Route',
                sortable: true,
                render: (_, l) => (
                  <span className="text-sm font-medium text-gray-900">
                    {l.origin} <span className="text-gray-300 mx-0.5">→</span> {l.destination}
                  </span>
                ),
              },
              {
                key: 'cargoType',
                header: 'Cargo',
                render: (_, l) => (
                  <span className="text-sm text-gray-600">{l.cargoType} · {l.weight}t</span>
                ),
              },
              {
                key: 'shipperId',
                header: 'Shipper',
                render: (_, l) => (
                  <span className="text-sm text-gray-600 max-w-[130px] truncate block">
                    {l.shipper?.company || l.shipper?.name || '—'}
                  </span>
                ),
              },
              {
                key: 'deliveryDate',
                header: 'Due Date',
                sortable: true,
                render: (_, l) => (
                  <span className="text-sm text-gray-600">{formatDate(l.deliveryDate)}</span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                sortable: true,
                render: (_, l) => <LoadStatusBadge status={l.status} />,
              },
              {
                key: 'id',
                header: 'Actions',
                render: (_, l) => {
                  const hasAction = !!NEXT_STATUS[l.status as LoadStatus];
                  return (
                    <div className="flex items-center justify-end gap-2">
                      {hasAction ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); setModalLoad(l); }}
                          className="h-8 px-3 text-xs font-medium rounded-lg bg-[#1E3A8A] text-white hover:bg-[#1e3a8a]/90 transition-colors flex items-center gap-1.5"
                        >
                          <Truck size={12} /> Update Status
                        </button>
                      ) : (
                        <Link
                          href={`/dashboard/transporter/track/${l.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 px-3 inline-flex items-center gap-1 text-xs text-[#1E3A8A] hover:underline"
                        >
                          View <ChevronRight size={12} />
                        </Link>
                      )}
                    </div>
                  );
                },
              },
            ] as Column<Load>[]}
            data={loads}
            keyField="id"
            onRowClick={(l) => router.push(`/dashboard/transporter/track/${l.id}`)}
          />
        )}
      </div>

      {/* ── AWAITING CONFIRMATION banners ────────────────────── */}
      {allLoads.filter((l) => l.status === 'AWAITING_CONFIRMATION').map((load) => (
        <div key={load.id} className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Truck size={15} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              Waiting for shipper confirmation — Load {load.shortId}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Delivery reported{load.deliveredAt ? ` on ${formatDateTime(load.deliveredAt)}` : ''}.
              Waiting for {load.shipper?.company || load.shipper?.name || 'the shipper'} to confirm.
              Auto-confirms after 48 hours.
            </p>
          </div>
          <Link
            href={`/dashboard/transporter/track/${load.id}`}
            className="text-xs text-[#1E3A8A] hover:underline shrink-0 flex items-center gap-0.5"
          >
            View <ChevronRight size={11} />
          </Link>
        </div>
      ))}

      {/* ── Update Status Modal ──────────────────────────────── */}
      {modalLoad && (
        <UpdateStatusModal load={modalLoad} onClose={() => setModalLoad(null)} />
      )}
    </div>
  );
}
