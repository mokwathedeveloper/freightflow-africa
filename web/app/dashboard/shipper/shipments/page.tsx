'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Package, ChevronRight, Search, Filter } from 'lucide-react';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Load, LoadStatus } from '@/types';

interface MyLoadsResponse {
  data: { loads: Load[]; total: number };
}

const FILTERS: { label: string; value: LoadStatus | 'ALL' }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Posted',    value: 'POSTED' },
  { label: 'In Transit', value: 'IN_TRANSIT' },
  { label: 'Awaiting',  value: 'AWAITING_CONFIRMATION' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Disputed',  value: 'DISPUTED' },
];

export default function ShipmentsPage() {
  const [filter, setFilter] = useState<LoadStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<MyLoadsResponse>({
    queryKey: ['shipper-loads'],
    queryFn: () => api.get('/loads/my?limit=100').then((r) => r.data),
  });

  const allLoads = data?.data.loads ?? [];
  const loads = allLoads
    .filter((l) => filter === 'ALL' || l.status === filter)
    .filter(
      (l) =>
        !search ||
        l.shortId.toLowerCase().includes(search.toLowerCase()) ||
        l.origin.toLowerCase().includes(search.toLowerCase()) ||
        l.destination.toLowerCase().includes(search.toLowerCase()) ||
        l.cargoType.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Shipments</h2>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage all your loads</p>
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, city, cargo..."
            className="ff-input pl-8"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={13} className="text-gray-400 mr-0.5" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 ml-auto shrink-0">
          {loads.length} result{loads.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-3 bg-gray-100 rounded flex-1" />
                <div className="h-5 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : loads.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-500">No shipments found</p>
            <p className="text-xs text-gray-400 mt-1">Try changing the filter or search term.</p>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Route</th>
                <th>Cargo</th>
                <th>Weight</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loads.map((load) => (
                <tr
                  key={load.id}
                  className="cursor-pointer"
                  onClick={() => window.location.href = `/dashboard/shipper/track/${load.id}`}
                >
                  <td className="font-mono text-xs text-gray-500">{load.shortId}</td>
                  <td>
                    <span className="font-medium text-gray-900">{load.origin}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="font-medium text-gray-900">{load.destination}</span>
                  </td>
                  <td className="text-gray-600">{load.cargoType}</td>
                  <td className="text-gray-600">{load.weight}t</td>
                  <td className="text-gray-600">{formatDate(load.deliveryDate)}</td>
                  <td><LoadStatusBadge status={load.status} /></td>
                  <td>
                    <Link
                      href={`/dashboard/shipper/track/${load.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-[#1E3A8A] hover:underline"
                    >
                      Track <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
