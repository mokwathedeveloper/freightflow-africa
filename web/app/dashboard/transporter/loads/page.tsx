'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Weight, Calendar, Loader2, Package, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToastStore } from '@/store/toast.store';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';
import type { Load } from '@/types';
import { KENYAN_CITIES, CARGO_TYPES } from '@/constants';

interface LoadsResponse {
  data: { loads: Load[]; total: number; page: number; pages: number };
}

export default function BrowseLoadsPage() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('');

  const { data, isLoading, refetch } = useQuery<LoadsResponse>({
    queryKey: ['available-loads', origin, destination, cargoType],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (origin) params.set('origin', origin);
      if (destination) params.set('destination', destination);
      if (cargoType) params.set('cargoType', cargoType);
      return api.get(`/loads?${params}`).then((r) => r.data);
    },
  });

  const acceptMut = useMutation({
    mutationFn: (loadId: string) => api.post(`/loads/${loadId}/accept`),
    onMutate: (id) => setAcceptingId(id),
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

  const loads = data?.data.loads ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Browse Available Loads</h2>
        <p className="text-sm text-gray-500 mt-0.5">Filter loads that match your route and vehicle.</p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="ff-label">Origin</label>
          <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="ff-input">
            <option value="">Any origin city</option>
            {KENYAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="ff-label">Destination</label>
          <select value={destination} onChange={(e) => setDestination(e.target.value)} className="ff-input">
            <option value="">Any destination city</option>
            {KENYAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="ff-label">Cargo Type</label>
          <select value={cargoType} onChange={(e) => setCargoType(e.target.value)} className="ff-input">
            <option value="">Any cargo type</option>
            {CARGO_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500">
        {isLoading ? 'Loading...' : `${loads.length} load${loads.length !== 1 ? 's' : ''} available`}
      </p>

      {/* Load cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-8 bg-gray-100 rounded w-32 ml-auto" />
            </div>
          ))}
        </div>
      ) : loads.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
          <Package className="mx-auto text-gray-300 mb-3" size={36} />
          <p className="text-sm font-medium text-gray-500">No loads available</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loads.map((load) => (
            <LoadCard
              key={load.id}
              load={load}
              onAccept={() => acceptMut.mutate(load.id)}
              accepting={acceptingId === load.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LoadCard({
  load, onAccept, accepting,
}: {
  load: Load; onAccept: () => void; accepting: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:border-[#1E3A8A]/30 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Route */}
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={15} className="text-[#1E3A8A] shrink-0" />
            <span className="font-semibold text-gray-900">
              {load.origin} <span className="text-gray-400 mx-1">→</span> {load.destination}
            </span>
          </div>
          {load.shipper && (
            <p className="text-xs text-gray-500 pl-5">
              Posted by {load.shipper.company || load.shipper.name}
            </p>
          )}
        </div>
        <span className="text-xs font-mono text-gray-400 shrink-0">{load.shortId}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Weight size={12} /> {load.weight}t
        </span>
        <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium text-gray-600">
          {load.cargoType}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} /> By {formatDate(load.deliveryDate)}
        </span>
        {load.preferredVehicle && (
          <span className="px-2 py-0.5 bg-blue-50 rounded-full text-[#1E3A8A] font-medium">
            {load.preferredVehicle}
          </span>
        )}
      </div>

      {load.notes && (
        <p className="mt-2 text-xs text-gray-500 italic border-l-2 border-gray-200 pl-3">
          {load.notes}
        </p>
      )}

      <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
        <Button
          size="sm"
          onClick={onAccept}
          disabled={accepting}
          className="min-w-32"
        >
          {accepting
            ? <><Loader2 className="animate-spin" size={13} /> Accepting...</>
            : <><CheckCircle2 size={13} /> Accept Load</>}
        </Button>
      </div>
    </div>
  );
}
