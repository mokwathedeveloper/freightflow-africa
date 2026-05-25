'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MapPin, Truck, Clock, ChevronRight, Package, Loader2 } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import LoadStatusBadge from '@/components/ui/LoadStatusBadge';
import api from '@/lib/api';
import type { Load } from '@/types';

const ACTIVE_STATUSES = ['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'AWAITING_CONFIRMATION'];

const PROGRESS: Record<string, number> = {
  ACCEPTED: 15, PICKED_UP: 40, IN_TRANSIT: 70, AWAITING_CONFIRMATION: 90, DELIVERED: 100,
};

function LoadCard({ load }: { load: Load }) {
  const progress = PROGRESS[load.status] ?? 0;
  const isActive = ACTIVE_STATUSES.includes(load.status);

  return (
    <Link
      href={`/dashboard/transporter/track/${load.id}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-[#1E3A8A]/30 transition-all group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              isActive ? 'bg-[#1E3A8A]/10' : 'bg-gray-100'
            )}>
              <Truck size={18} className={isActive ? 'text-[#1E3A8A]' : 'text-gray-400'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">
                Load #{load.shortId}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{load.cargoType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LoadStatusBadge status={load.status} />
            <ChevronRight size={14} className="text-gray-300 group-hover:text-[#1E3A8A] transition-colors" />
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#1E3A8A] shrink-0" />
              <p className="text-xs font-medium text-gray-700 truncate">{load.origin}</p>
            </div>
            {/* Progress bar */}
            <div className="h-0.5 bg-gray-100 rounded-full mx-3.5 my-1">
              <div
                className="h-0.5 bg-[#1E3A8A] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'w-2 h-2 rounded-full shrink-0',
                load.status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'
              )} />
              <p className="text-xs font-medium text-gray-700 truncate">{load.destination}</p>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Package size={11} /> {load.weight}t
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> By {formatDate(load.deliveryDate)}
          </span>
          {load.lastLocation && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} /> {load.lastLocation}
            </span>
          )}
          <span className="ml-auto text-[#1E3A8A] font-semibold">
            {progress}% done
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function TransporterTrackPage() {
  const { data, isLoading } = useQuery<{ data: { loads: Load[] } }>({
    queryKey: ['transporter-jobs'],
    queryFn: () => api.get('/loads/my').then((r) => r.data),
  });

  const allLoads = data?.data?.loads ?? [];
  const active = allLoads.filter((l) => ACTIVE_STATUSES.includes(l.status));
  const completed = allLoads.filter((l) => l.status === 'DELIVERED').slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Track Route</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Monitor your active deliveries and update status on the go.
        </p>
      </div>

      {/* USSD banner */}
      <div className="bg-[#1E3A8A] rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Truck size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">No internet? Use USSD</p>
          <p className="text-xs text-white/70 mt-0.5">
            Dial <span className="font-mono font-bold text-white">*384*7447#</span> from any phone to update your delivery status without data.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-gray-400" size={24} />
        </div>
      ) : (
        <>
          {/* Active deliveries */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Active Deliveries</h3>
              <span className="text-xs text-gray-400">{active.length} job{active.length !== 1 ? 's' : ''}</span>
            </div>

            {active.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                <Truck className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-sm font-medium text-gray-500">No active deliveries</p>
                <p className="text-xs text-gray-400 mt-1">
                  Accept a load from{' '}
                  <Link href="/dashboard/transporter/loads" className="text-[#1E3A8A] hover:underline">
                    Browse Loads
                  </Link>{' '}
                  to start tracking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {active.map((load) => <LoadCard key={load.id} load={load} />)}
              </div>
            )}
          </section>

          {/* Recent completions */}
          {completed.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Recently Completed</h3>
                <Link
                  href="/dashboard/transporter/jobs"
                  className="text-xs text-[#1E3A8A] hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completed.map((load) => <LoadCard key={load.id} load={load} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
