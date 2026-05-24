'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, Loader2, Package, CheckCircle2, ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/store/toast.store';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';
import { KENYAN_CITIES, CARGO_TYPES } from '@/constants';

interface LoadsResponse {
  data: { loads: Load[]; total: number; page: number; pages: number };
}

// Deterministic color from a string — maps company initials to a palette
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
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function BrowseLoadsPage() {
  const qc        = useQueryClient();
  const addToast  = useToastStore((s) => s.addToast);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [search,      setSearch]      = useState('');
  const [origin,      setOrigin]      = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType,   setCargoType]   = useState('');

  const { data, isLoading, refetch } = useQuery<LoadsResponse>({
    queryKey: ['available-loads', origin, destination, cargoType],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '100' });
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

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* ── Page header ──────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Available Loads</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Browse loads that match your route and vehicle type.
        </p>
      </div>

      {/* ── Filter bar ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search loads, cities, cargo, shipper..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ff-input pl-9"
            />
          </div>

          {/* Origin filter */}
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="ff-input sm:w-44"
          >
            <option value="">All Origins</option>
            {KENYAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Destination filter */}
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="ff-input sm:w-44"
          >
            <option value="">All Destinations</option>
            {KENYAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Cargo Type filter */}
          <select
            value={cargoType}
            onChange={(e) => setCargoType(e.target.value)}
            className="ff-input sm:w-44"
          >
            <option value="">All Cargo Types</option>
            {CARGO_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* ── Results count ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 flex items-center gap-1.5">
          <Filter size={12} className="text-gray-400" />
          {isLoading ? 'Loading...' : `${loads.length} load${loads.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* ── Data table ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          // Skeleton rows
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
          // Empty state
          <div className="py-20 text-center">
            <div className="w-14 h-14 mx-auto rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
              <Package size={26} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No loads available right now</p>
            <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              New loads are posted regularly. We'll send you an SMS when a load matches your route.
            </p>
            <button
              onClick={() => { setOrigin(''); setDestination(''); setCargoType(''); setSearch(''); }}
              className="mt-4 text-xs text-[#1E3A8A] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Shipper</th>
                <th>Route</th>
                <th>Cargo Type</th>
                <th>Weight</th>
                <th>Date</th>
                <th className="text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => {
                const companyName = load.shipper?.company || load.shipper?.name || 'Unknown';
                const bg  = avatarColor(companyName);
                const ini = initials(companyName);
                const accepting = acceptingId === load.id;

                return (
                  <tr key={load.id} className="group">
                    {/* Load ID */}
                    <td>
                      <span className="font-mono text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                        {load.shortId}
                      </span>
                    </td>

                    {/* Shipper */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
                          bg
                        )}>
                          {ini}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {companyName}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Route */}
                    <td>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="font-semibold text-gray-900">{load.origin}</span>
                        <span className="text-gray-300 mx-0.5">→</span>
                        <span className="font-semibold text-gray-900">{load.destination}</span>
                      </div>
                    </td>

                    {/* Cargo Type */}
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {load.cargoType}
                      </span>
                    </td>

                    {/* Weight */}
                    <td className="text-sm text-gray-600 tabular-nums">
                      {load.weight} t
                    </td>

                    {/* Date */}
                    <td className="text-sm text-gray-600">
                      {formatDate(load.deliveryDate)}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/transporter/track/${load.id}`}
                          className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                        >
                          Details <ChevronRight size={11} />
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => acceptMut.mutate(load.id)}
                          disabled={accepting}
                          className="h-8 px-3 text-xs"
                        >
                          {accepting
                            ? <><Loader2 className="animate-spin" size={12} /> Accepting…</>
                            : <><CheckCircle2 size={13} /> Accept Load</>}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination hint ──────────────────────────────────── */}
      {!isLoading && loads.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Showing {loads.length} of {data?.data.total ?? loads.length} loads
        </p>
      )}
    </div>
  );
}
