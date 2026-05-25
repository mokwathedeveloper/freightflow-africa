'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, Loader2, Package, CheckCircle2, ChevronRight,
  LayoutGrid, List,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/store/toast.store';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';
import { KENYAN_CITIES, CARGO_TYPES } from '@/constants';
import DataTable, { Column } from '@/components/Table/DataTable';
import FilterDropdown, { FilterOption } from '@/components/Filters/FilterDropdown';
import LoadCard from '@/components/loads/LoadCard';
import Pagination from '@/components/loads/Pagination';

const PAGE_SIZE = 12;

interface LoadsResponse {
  data: { loads: Load[]; total: number; page: number; pages: number };
}

const AVATAR_COLORS = [
  'bg-blue-600',   'bg-indigo-600', 'bg-violet-600', 'bg-purple-600',
  'bg-pink-600',   'bg-rose-600',   'bg-orange-600', 'bg-amber-600',
  'bg-teal-600',   'bg-cyan-600',   'bg-green-700',  'bg-emerald-600',
];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

export default function BrowseLoadsPage() {
  const qc       = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [view,        setView]        = useState<'table' | 'grid'>('table');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [search,      setSearch]      = useState('');
  const [origin,      setOrigin]      = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType,   setCargoType]   = useState('');
  const [page,        setPage]        = useState(1);

  // Reset page when filters change
  function resetPage() { setPage(1); }

  const { data, isLoading, refetch } = useQuery<LoadsResponse>({
    queryKey: ['available-loads', origin, destination, cargoType, page],
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
      if (origin)      params.set('origin', origin);
      if (destination) params.set('destination', destination);
      if (cargoType)   params.set('cargoType', cargoType);
      return api.get(`/loads?${params}`).then((r) => r.data);
    },
  });

  const acceptMut = useMutation({
    mutationFn: (loadId: string) => api.post(`/loads/${loadId}/accept`),
    onMutate:  (id) => setAcceptingId(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['available-loads'] });
      qc.invalidateQueries({ queryKey: ['transporter-jobs'] });
      addToast('success', 'Load accepted! The shipper has been notified via SMS.');
      setAcceptingId(null);
    },
    onError: () => {
      addToast('error', 'Could not accept this load — it may have already been taken.');
      setAcceptingId(null);
      refetch();
    },
  });

  const allLoads = data?.data.loads ?? [];
  const loads = allLoads.filter((l) =>
    !search ||
    l.shortId.toLowerCase().includes(search.toLowerCase()) ||
    l.origin.toLowerCase().includes(search.toLowerCase()) ||
    l.destination.toLowerCase().includes(search.toLowerCase()) ||
    l.cargoType.toLowerCase().includes(search.toLowerCase()) ||
    (l.shipper?.company ?? l.shipper?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = data?.data.total ?? 0;
  const totalPages = data?.data.pages ?? 1;

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    resetPage();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Available Loads</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse loads that match your route and vehicle type.
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg shrink-0">
          <button
            onClick={() => setView('table')}
            aria-label="Table view"
            aria-pressed={view === 'table'}
            className={cn(
              'w-8 h-7 flex items-center justify-center rounded-md transition-colors',
              view === 'table' ? 'bg-white shadow-sm text-[#1E3A8A]' : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <List size={14} />
          </button>
          <button
            onClick={() => setView('grid')}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            className={cn(
              'w-8 h-7 flex items-center justify-center rounded-md transition-colors',
              view === 'grid' ? 'bg-white shadow-sm text-[#1E3A8A]' : 'text-gray-400 hover:text-gray-600',
            )}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search loads, cities, cargo, shipper..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="ff-input pl-9"
            />
          </div>

          <FilterDropdown
            label="All Origins"
            options={[
              { label: 'All Origins', value: '' },
              ...KENYAN_CITIES.map((c) => ({ label: c, value: c })),
            ] as FilterOption[]}
            selected={origin}
            onChange={handleFilterChange(setOrigin)}
          />

          <FilterDropdown
            label="All Destinations"
            options={[
              { label: 'All Destinations', value: '' },
              ...KENYAN_CITIES.map((c) => ({ label: c, value: c })),
            ] as FilterOption[]}
            selected={destination}
            onChange={handleFilterChange(setDestination)}
          />

          <FilterDropdown
            label="All Cargo Types"
            options={[
              { label: 'All Cargo Types', value: '' },
              ...CARGO_TYPES.map((c) => ({ label: c, value: c })),
            ] as FilterOption[]}
            selected={cargoType}
            onChange={handleFilterChange(setCargoType)}
          />
        </div>
      </div>

      {/* ── Results count ───────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <Filter size={12} className="text-gray-400" />
        <p className="text-xs text-gray-500">
          {isLoading ? 'Loading...' : `${totalItems} load${totalItems !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* ── Table view ──────────────────────────────────── */}
      {view === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-20 shrink-0" />
                  <div className="w-8 h-8 bg-gray-100 rounded-full shrink-0" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded flex-1" />
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-8 bg-gray-100 rounded w-28" />
                </div>
              ))}
            </div>
          ) : loads.length === 0 ? (
            <EmptyState onClearFilters={() => { setOrigin(''); setDestination(''); setCargoType(''); setSearch(''); }} />
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
                  key: 'shipperId',
                  header: 'Shipper',
                  render: (_, l) => {
                    const name = l.shipper?.company || l.shipper?.name || 'Unknown';
                    return (
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
                          avatarColor(name),
                        )}>
                          {initials(name)}
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{name}</p>
                      </div>
                    );
                  },
                },
                {
                  key: 'origin',
                  header: 'Route',
                  sortable: true,
                  render: (_, l) => (
                    <div className="flex items-center gap-1 text-sm">
                      <span className="font-semibold text-gray-900">{l.origin}</span>
                      <span className="text-gray-300 mx-0.5">→</span>
                      <span className="font-semibold text-gray-900">{l.destination}</span>
                    </div>
                  ),
                },
                {
                  key: 'cargoType',
                  header: 'Cargo Type',
                  render: (_, l) => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {l.cargoType}
                    </span>
                  ),
                },
                {
                  key: 'weight',
                  header: 'Weight',
                  render: (_, l) => (
                    <span className="text-sm text-gray-600 tabular-nums">{l.weight} t</span>
                  ),
                },
                {
                  key: 'deliveryDate',
                  header: 'Date',
                  sortable: true,
                  render: (_, l) => (
                    <span className="text-sm text-gray-600">{formatDate(l.deliveryDate)}</span>
                  ),
                },
                {
                  key: 'id',
                  header: 'Actions',
                  render: (_, l) => {
                    const accepting = acceptingId === l.id;
                    return (
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/transporter/track/${l.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          Details <ChevronRight size={11} />
                        </Link>
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); acceptMut.mutate(l.id); }}
                          disabled={accepting}
                          className="h-8 px-3 text-xs"
                        >
                          {accepting
                            ? <><Loader2 className="animate-spin" size={12} /> Accepting…</>
                            : <><CheckCircle2 size={13} /> Accept Load</>}
                        </Button>
                      </div>
                    );
                  },
                },
              ] as Column<Load>[]}
              data={loads}
              keyField="id"
            />
          )}
        </div>
      )}

      {/* ── Grid / Card view ────────────────────────────── */}
      {view === 'grid' && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-14 bg-gray-100 rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((j) => <div key={j} className="h-14 bg-gray-100 rounded-lg" />)}
                  </div>
                  <div className="h-9 bg-gray-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : loads.length === 0 ? (
            <EmptyState onClearFilters={() => { setOrigin(''); setDestination(''); setCargoType(''); setSearch(''); }} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loads.map((load) => (
                <LoadCard
                  key={load.id}
                  load={load}
                  detailHref={`/dashboard/transporter/track/${load.id}`}
                  onAccept={(id) => acceptMut.mutate(id)}
                  isAccepting={acceptingId === load.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Pagination ──────────────────────────────────── */}
      {!isLoading && totalItems > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function EmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="py-20 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="w-14 h-14 mx-auto rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
        <Package size={26} className="text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-700">No loads available right now</p>
      <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
        New loads are posted regularly. We&apos;ll send you an SMS when a load matches your route.
      </p>
      <button
        onClick={onClearFilters}
        className="mt-4 text-xs text-[#1E3A8A] hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
