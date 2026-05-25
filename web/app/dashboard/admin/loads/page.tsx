'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search, Download, Plus, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load, LoadStatus } from '@/types';
import DataTable, { Column } from '@/components/Table/DataTable';
import FilterDropdown, { FilterOption } from '@/components/Filters/FilterDropdown';

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
  { label: 'All Cargo Types',    value: 'ALL' },
  { label: 'Electronics',        value: 'Electronics' },
  { label: 'Furniture',          value: 'Furniture' },
  { label: 'Food & Beverage',    value: 'Food & Beverage' },
  { label: 'Machinery',          value: 'Machinery' },
  { label: 'Steel Products',     value: 'Steel Products' },
  { label: 'Fresh Produce',      value: 'Fresh Produce' },
  { label: 'Automotive Parts',   value: 'Automotive Parts' },
];

// Design-system-matched status badges
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
  switch (status) {
    case 'POSTED':                return 'Posted';
    case 'ACCEPTED':              return 'Accepted';
    case 'PICKED_UP':             return 'Picked Up';
    case 'IN_TRANSIT':            return 'In Transit';
    case 'AWAITING_CONFIRMATION': return 'Awaiting';
    case 'DELIVERED':             return 'Delivered';
    case 'DISPUTED':              return 'Disputed';
    case 'CANCELLED':             return 'Cancelled';
    default:                      return status;
  }
}

// Deterministic colored avatar matching the mockup shipper initials palette
const AVATAR_COLORS = [
  'bg-blue-600 text-white',    'bg-indigo-600 text-white',
  'bg-teal-600 text-white',    'bg-emerald-600 text-white',
  'bg-violet-600 text-white',  'bg-orange-600 text-white',
  'bg-rose-600 text-white',    'bg-cyan-600 text-white',
];
function avatarClass(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

const PAGE_SIZE = 10;

export default function AdminLoadsPage() {
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState('ALL');
  const [cargoType, setCargoType] = useState('ALL');
  const [page,      setPage]      = useState(1);

  const { data, isLoading } = useQuery<LoadsResponse>({
    queryKey: ['admin-loads'],
    queryFn: () => api.get('/admin/loads?limit=200').then((r) => r.data),
  });

  const allLoads = data?.data.loads ?? [];

  const filtered = allLoads.filter((l) => {
    const matchStatus = status === 'ALL' || l.status === status;
    const matchCargo  = cargoType === 'ALL' || l.cargoType === cargoType;
    const matchSearch = !search ||
      l.shortId.toLowerCase().includes(search.toLowerCase()) ||
      l.origin.toLowerCase().includes(search.toLowerCase()) ||
      l.destination.toLowerCase().includes(search.toLowerCase()) ||
      (l.shipper?.company ?? l.shipper?.name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCargo && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Load Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create, view, and manage all platform loads in one place.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export Report
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e3a8a]/90 transition-colors">
            <Plus size={14} /> Add Load
          </button>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ID, shipper, or route..."
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

        {/* Date range (static display) */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 h-8 bg-white">
          All Routes
        </div>

        <p className="text-xs text-gray-400 ml-auto shrink-0">{filtered.length} loads</p>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <DataTable<Load>
          keyField="id"
          loading={isLoading}
          data={paged}
          emptyMessage="No loads found. Try adjusting the search or filters."
          columns={[
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
              render: () => (
                <button className="h-7 px-3 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Edit
                </button>
              ),
            },
          ] as Column<Load>[]}
        />
      </div>

      {/* ── Pagination ───────────────────────────────────────── */}
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
    </div>
  );
}
