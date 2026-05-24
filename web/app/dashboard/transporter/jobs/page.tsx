'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Briefcase, ChevronRight, Filter } from 'lucide-react';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Load, LoadStatus } from '@/types';

interface MyLoadsResponse {
  data: { loads: Load[]; total: number };
}

const FILTERS: { label: string; value: string }[] = [
  { label: 'All',       value: 'ALL' },
  { label: 'Active',    value: 'ACTIVE' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const ACTIVE_STATUSES = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION'];

export default function JobsPage() {
  const [filter, setFilter] = useState('ALL');

  const { data, isLoading } = useQuery<MyLoadsResponse>({
    queryKey: ['transporter-jobs'],
    queryFn: () => api.get('/loads/my?limit=100').then((r) => r.data),
  });

  const allLoads = data?.data.loads ?? [];
  const loads = allLoads.filter((l) => {
    if (filter === 'ALL')       return true;
    if (filter === 'ACTIVE')    return ACTIVE_STATUSES.includes(l.status);
    if (filter === 'DELIVERED') return l.status === 'DELIVERED';
    if (filter === 'CANCELLED') return l.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      <div>
        <h2 className="text-xl font-bold text-gray-900">My Jobs</h2>
        <p className="text-sm text-gray-500 mt-0.5">All accepted loads and their current status</p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-gray-400" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{loads.length} job{loads.length !== 1 ? 's' : ''}</span>
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
            <Briefcase className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-sm font-medium text-gray-500">No jobs found</p>
            <p className="text-xs text-gray-400 mt-1">Accept a load to get started.</p>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Load ID</th>
                <th>Route</th>
                <th>Cargo</th>
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
                  onClick={() => window.location.href = `/dashboard/transporter/track/${load.id}`}
                >
                  <td className="font-mono text-xs text-gray-500">{load.shortId}</td>
                  <td>
                    <span className="font-medium text-gray-900">{load.origin}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span className="font-medium text-gray-900">{load.destination}</span>
                  </td>
                  <td className="text-gray-600">{load.cargoType} · {load.weight}t</td>
                  <td className="text-gray-600">{formatDate(load.deliveryDate)}</td>
                  <td><LoadStatusBadge status={load.status} /></td>
                  <td>
                    <Link
                      href={`/dashboard/transporter/track/${load.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-[#1E3A8A] hover:underline"
                    >
                      Update <ChevronRight size={12} />
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
