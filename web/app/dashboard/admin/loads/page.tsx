'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, Search, Download, ChevronLeft,
  ChevronRight as ChevronRightIcon, MapPin, Weight,
  Calendar, User, Truck, AlertTriangle,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';
import type { Load } from '@/types';
import DataTable, { Column } from '@/components/Table/DataTable';
import FilterDropdown, { FilterOption } from '@/components/Filters/FilterDropdown';
import Modal from '@/components/Modal/Modal';
import ConfirmModal from '@/components/modals/ConfirmModal';

interface LoadsResponse {
  data: { loads: Load[]; total: number };
}

const STATUS_OPTIONS: FilterOption[] = [
  { label: 'All Statuses',   value: 'ALL' },
  { label: 'Posted',         value: 'POSTED' },
  { label: 'Accepted',       value: 'ACCEPTED' },
  { label: 'Picked Up',      value: 'PICKED_UP' },
  { label: 'In Transit',     value: 'IN_TRANSIT' },
  { label: 'Awaiting',       value: 'AWAITING_CONFIRMATION' },
  { label: 'Delivered',      value: 'DELIVERED' },
  { label: 'Disputed',       value: 'DISPUTED' },
  { label: 'Cancelled',      value: 'CANCELLED' },
];

const CARGO_TYPE_OPTIONS: FilterOption[] = [
  { label: 'All Cargo Types',  value: 'ALL' },
  { label: 'Electronics',      value: 'Electronics' },
  { label: 'Furniture',        value: 'Furniture' },
  { label: 'Food & Beverage',  value: 'Food & Beverage' },
  { label: 'Machinery',        value: 'Machinery' },
  { label: 'Steel Products',   value: 'Steel Products' },
  { label: 'Fresh Produce',    value: 'Fresh Produce' },
  { label: 'Automotive Parts', value: 'Automotive Parts' },
];

function statusBadge(status: string) {
  switch (status) {
    case 'POSTED':                return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ACCEPTED':              return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'PICKED_UP':             return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'IN_TRANSIT':            return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'AWAITING_CONFIRMATION': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'DELIVERED':             return 'bg-green-100 text-green-800 border-green-200';
    case 'DISPUTED':              return 'bg-red-100 text-red-800 border-red-200';
    case 'CANCELLED':             return 'bg-gray-100 text-gray-600 border-gray-200';
    default:                      return 'bg-gray-100 text-gray-500 border-gray-200';
  }
}

function statusLabel(status: string) {
  const MAP: Record<string, string> = {
    POSTED: 'Posted', ACCEPTED: 'Accepted', PICKED_UP: 'Picked Up',
    IN_TRANSIT: 'In Transit', AWAITING_CONFIRMATION: 'Awaiting',
    DELIVERED: 'Delivered', DISPUTED: 'Disputed', CANCELLED: 'Cancelled',
  };
  return MAP[status] ?? status;
}

const AVATAR_COLORS = [
  'bg-blue-600 text-white', 'bg-indigo-600 text-white',
  'bg-teal-600 text-white', 'bg-emerald-600 text-white',
  'bg-violet-600 text-white', 'bg-orange-600 text-white',
];
function avatarClass(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(loads: Load[]) {
  const rows = [
    ['Load ID', 'Shipper', 'Origin', 'Destination', 'Cargo Type', 'Weight (kg)', 'Status', 'Transporter', 'Created', 'Delivery Date'],
    ...loads.map((l) => [
      l.shortId,
      (l.shipper?.company ?? l.shipper?.name ?? ''),
      l.origin,
      l.destination,
      l.cargoType,
      l.weight,
      l.status,
      (l.transporter?.name ?? 'Unassigned'),
      new Date(l.createdAt).toLocaleDateString('en-KE'),
      new Date(l.deliveryDate).toLocaleDateString('en-KE'),
    ]),
  ];
  const csv  = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `freightflow-loads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Detail field row ─────────────────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 shrink-0 w-32">{label}</span>
      <span className="text-xs font-medium text-gray-900 text-right">{value ?? '—'}</span>
    </div>
  );
}

// ─── Load detail modal ────────────────────────────────────────────────────────
function LoadDetailModal({ load, onClose }: { load: Load; onClose: () => void }) {
  const qc       = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const cancelMut = useMutation({
    mutationFn: () => api.post(`/loads/${load.id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-loads'] });
      addToast('success', `Load ${load.shortId} cancelled`);
      onClose();
    },
    onError: () => addToast('error', 'Failed to cancel load'),
  });

  const canCancel = ['POSTED', 'ACCEPTED'].includes(load.status);
  const shipperName = load.shipper?.company ?? load.shipper?.name ?? 'Unknown';
  const transporterName = load.transporter?.name;

  return (
    <div className="space-y-5">

      {/* Load ID + status */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded">
          {load.shortId}
        </span>
        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', statusBadge(load.status))}>
          {statusLabel(load.status)}
        </span>
      </div>

      {/* Route */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin size={12} className="text-[#1E3A8A] shrink-0" />
            <p className="text-sm font-semibold text-gray-900 truncate">{load.origin}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-green-600 shrink-0" />
            <p className="text-sm font-semibold text-gray-900 truncate">{load.destination}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-xs text-gray-500 justify-end mb-1">
            <Weight size={11} /> {load.weight} kg
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
            <Calendar size={11} /> {formatDate(load.deliveryDate)}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-xl border border-gray-100 px-4 py-1">
        <DetailRow label="Cargo Type"  value={load.cargoType} />
        <DetailRow label="Notes"       value={load.notes} />
        <DetailRow label="Posted"      value={formatDate(load.createdAt)} />
        {load.acceptedAt  && <DetailRow label="Accepted"    value={formatDate(load.acceptedAt)} />}
        {load.pickedUpAt  && <DetailRow label="Picked Up"   value={formatDate(load.pickedUpAt)} />}
        {load.deliveredAt && <DetailRow label="Delivered"   value={formatDate(load.deliveredAt)} />}
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-xl p-3.5">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><User size={11} /> Shipper</p>
          <p className="text-sm font-semibold text-gray-900">{shipperName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{load.shipper?.phone ?? '—'}</p>
        </div>
        <div className={cn('rounded-xl p-3.5', transporterName ? 'bg-green-50' : 'bg-gray-50')}>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Truck size={11} /> Transporter</p>
          {transporterName ? (
            <>
              <p className="text-sm font-semibold text-gray-900">{transporterName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{load.transporter?.phone ?? '—'}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">Not assigned</p>
          )}
        </div>
      </div>

      {/* Rating */}
      {load.rating && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm">
          <span className="font-semibold text-amber-800">Shipper Rating:</span>{' '}
          <span className="text-amber-700">{load.rating}/5</span>
        </div>
      )}

      {/* Cancel action */}
      {canCancel && (
        <button
          onClick={() => setConfirmCancel(true)}
          className="w-full h-9 rounded-lg border border-red-200 bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle size={13} /> Cancel Load
        </button>
      )}

      <ConfirmModal
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel Load"
        description={`Cancelling ${load.shortId} is irreversible. The shipper and transporter will be notified.`}
        confirmLabel="Yes, Cancel"
        cancelLabel="Keep Load"
        isDangerous
        isPending={cancelMut.isPending}
        onConfirm={() => cancelMut.mutate()}
      />

      <button
        onClick={onClose}
        className="w-full h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        Close
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

export default function AdminLoadsPage() {
  const [search,       setSearch]       = useState('');
  const [status,       setStatus]       = useState('ALL');
  const [cargoType,    setCargoType]    = useState('ALL');
  const [page,         setPage]         = useState(1);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

  const { data, isLoading } = useQuery<LoadsResponse>({
    queryKey: ['admin-loads'],
    queryFn: () => api.get('/admin/loads?limit=200').then((r) => r.data),
  });

  const allLoads = data?.data.loads ?? [];

  const filtered = allLoads.filter((l) => {
    const matchStatus = status === 'ALL' || l.status === status;
    const matchCargo  = cargoType === 'ALL' || l.cargoType === cargoType;
    const matchSearch = !search
      || l.shortId.toLowerCase().includes(search.toLowerCase())
      || l.origin.toLowerCase().includes(search.toLowerCase())
      || l.destination.toLowerCase().includes(search.toLowerCase())
      || (l.shipper?.company ?? l.shipper?.name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCargo && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<Load>[] = [
    {
      key: 'shortId',
      header: 'Load ID',
      render: (_, l) => (
        <span className="font-mono text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
          {l.shortId}
        </span>
      ),
    },
    {
      key: 'shipperId',
      header: 'Shipper',
      render: (_, l) => {
        const name = l.shipper?.company || l.shipper?.name || 'Unknown';
        return (
          <div className="flex items-center gap-2.5">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0', avatarClass(name))}>
              {initials(name)}
            </div>
            <p className="text-xs font-semibold text-gray-900 truncate max-w-[110px]">{name}</p>
          </div>
        );
      },
    },
    {
      key: 'origin',
      header: 'Route',
      sortable: true,
      render: (_, l) => (
        <>
          <p className="text-xs font-medium text-gray-900">{l.origin}</p>
          <p className="text-xs text-gray-400 mt-0.5">→ {l.destination}</p>
        </>
      ),
    },
    {
      key: 'cargoType',
      header: 'Cargo Type',
      sortable: true,
      render: (_, l) => <span className="text-xs text-gray-600">{l.cargoType}</span>,
    },
    {
      key: 'deliveryDate',
      header: 'Date Range',
      sortable: true,
      render: (_, l) => (
        <>
          <p className="text-xs text-gray-600">{formatDate(l.createdAt)}</p>
          <p className="text-xs text-gray-400 mt-0.5">→ {formatDate(l.deliveryDate)}</p>
        </>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_, l) => (
        <span className={cn('inline-flex text-xs font-medium px-2 py-0.5 rounded-full border', statusBadge(l.status))}>
          {statusLabel(l.status)}
        </span>
      ),
    },
    {
      key: 'transporterId',
      header: 'Transporter',
      render: (_, l) => {
        const name = l.transporter?.name;
        if (!name) return <span className="text-xs text-gray-400 italic">Unassigned</span>;
        return (
          <div className="flex items-center gap-2">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0', avatarClass(name))}>
              {initials(name)}
            </div>
            <p className="text-xs font-medium text-gray-900 truncate max-w-[100px]">{name}</p>
          </div>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, l) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedLoad(l); }}
          className="h-7 px-3 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Load Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">View, filter, and manage all platform loads.</p>
        </div>
        <button
          onClick={() => filtered.length > 0 && exportCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-40"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ID, shipper, or route…"
            className="ff-input pl-8 h-8 text-xs"
          />
        </div>
        <FilterDropdown
          label="All Statuses"
          options={STATUS_OPTIONS}
          selected={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
        />
        <FilterDropdown
          label="All Cargo Types"
          options={CARGO_TYPE_OPTIONS}
          selected={cargoType}
          onChange={(v) => { setCargoType(v); setPage(1); }}
        />
        <p className="text-xs text-gray-400 ml-auto shrink-0">{filtered.length} loads</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filtered.length === 0 && !isLoading ? (
          <div className="py-16 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-500">No loads found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting the search or filters.</p>
          </div>
        ) : (
          <DataTable<Load>
            keyField="id"
            loading={isLoading}
            data={paged}
            columns={columns}
            onRowClick={(l) => setSelectedLoad(l)}
          />
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} loads
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return start + i;
            }).filter((p) => p >= 1 && p <= totalPages).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-medium border transition-colors',
                  page === p
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRightIcon size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Load detail modal */}
      <Modal
        isOpen={!!selectedLoad}
        onClose={() => setSelectedLoad(null)}
        title="Load Details"
        size="md"
      >
        {selectedLoad && (
          <LoadDetailModal
            load={selectedLoad}
            onClose={() => setSelectedLoad(null)}
          />
        )}
      </Modal>
    </div>
  );
}
