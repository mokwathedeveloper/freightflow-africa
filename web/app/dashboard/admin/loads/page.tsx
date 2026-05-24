'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search, Download, Plus, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import type { Load, LoadStatus } from '@/types';

interface LoadsResponse {
  data: { loads: Load[]; total: number };
}

const STATUS_OPTIONS = ['All Statuses', 'POSTED', 'IN_TRANSIT', 'AWAITING_CONFIRMATION', 'DELIVERED', 'DISPUTED', 'CANCELLED'] as const;
const CARGO_TYPES = ['All Cargo Types', 'Electronics', 'Furniture', 'Food & Beverage', 'Machinery', 'Steel Products', 'Fresh Produce', 'Automotive Parts'] as const;

function statusBadge(status: LoadStatus | string) {
  switch (status) {
    case 'DELIVERED':             return 'bg-green-50 text-green-700 border-green-200';
    case 'IN_TRANSIT':            return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'POSTED':                return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'AWAITING_CONFIRMATION': return 'bg-[#1E3A8A]/5 text-[#1E3A8A] border-[#1E3A8A]/20';
    case 'DISPUTED':              return 'bg-red-50 text-red-700 border-red-200';
    case 'CANCELLED':             return 'bg-gray-100 text-gray-500 border-gray-200';
    default:                      return 'bg-gray-100 text-gray-500 border-gray-200';
  }
}

function statusLabel(status: LoadStatus | string) {
  switch (status) {
    case 'DELIVERED':             return 'Delivered';
    case 'IN_TRANSIT':            return 'In Transit';
    case 'POSTED':                return 'Pending Pricing';
    case 'AWAITING_CONFIRMATION': return 'Assigned';
    case 'DISPUTED':              return 'Delayed';
    case 'CANCELLED':             return 'Cancelled';
    default:                      return status;
  }
}

const PAGE_SIZE = 10;

export default function AdminLoadsPage() {
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('All Statuses');
  const [cargoType, setCargoType] = useState('All Cargo Types');
  const [page, setPage]           = useState(1);

  const { data, isLoading } = useQuery<LoadsResponse>({
    queryKey: ['admin-loads'],
    queryFn: () => api.get('/admin/loads?limit=200').then((r) => r.data),
  });

  const allLoads = data?.data.loads ?? [];

  const filtered = allLoads.filter((l) => {
    const matchStatus = status === 'All Statuses' || l.status === status;
    const matchCargo  = cargoType === 'All Cargo Types' || l.cargoType === cargoType;
    const matchSearch = !search
      || l.shortId.toLowerCase().includes(search.toLowerCase())
      || l.origin.toLowerCase().includes(search.toLowerCase())
      || l.destination.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCargo && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Load Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create, view, and manage all your platform loads in one place.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={14} /> Export Report
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#16A34A] text-white text-sm font-medium hover:bg-green-700 transition-colors">
            <Plus size={14} /> Add Load
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by ID, shipper, or route..."
            className="ff-input pl-8 text-xs h-8"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="ff-input h-8 text-xs w-auto pr-7"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'All Statuses' ? 'All Statuses' : statusLabel(s)}</option>
          ))}
        </select>
        <select
          value={cargoType}
          onChange={(e) => { setCargoType(e.target.value); setPage(1); }}
          className="ff-input h-8 text-xs w-auto pr-7"
        >
          {CARGO_TYPES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 h-8 bg-white">
          <span>May 10 – May 16, 2024</span>
        </div>
        <p className="text-xs text-gray-400 ml-auto">{filtered.length} loads</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded flex-1" />
                <div className="h-5 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : paged.length === 0 ? (
          <div className="py-14 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-sm font-medium text-gray-500">No loads found</p>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Shipper</th>
                <th>Route</th>
                <th>Cargo Type</th>
                <th>Status</th>
                <th>Assigned Transporter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div>
                      <p className="font-mono text-xs font-medium text-gray-900">{l.shortId}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(l.createdAt)}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                        {((l as unknown as Record<string, unknown>).shipper as {name?: string} | undefined)?.name?.charAt(0) ?? 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">{((l as unknown as Record<string, unknown>).shipper as {name?: string; company?: string} | undefined)?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{((l as unknown as Record<string, unknown>).shipper as {company?: string} | undefined)?.company ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{l.origin}</p>
                      <p className="text-xs text-gray-400">{l.destination}</p>
                    </div>
                  </td>
                  <td className="text-xs text-gray-600">{l.cargoType}</td>
                  <td>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', statusBadge(l.status))}>
                      {statusLabel(l.status)}
                    </span>
                  </td>
                  <td>
                    {((l as unknown as Record<string, unknown>).transporter as {name?: string} | undefined)?.name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-700 shrink-0">
                          {((l as unknown as Record<string, unknown>).transporter as {name?: string} | undefined)?.name?.charAt(0)}
                        </div>
                        <p className="text-xs font-medium text-gray-900">{((l as unknown as Record<string, unknown>).transporter as {name?: string} | undefined)?.name}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors text-xs">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} loads
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn('w-7 h-7 rounded-lg text-xs font-medium border transition-colors', page === p ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronRightIcon size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
