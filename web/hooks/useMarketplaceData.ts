import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/store/toast.store';
import api from '@/lib/api';
import type { Load } from '@/types';

interface MarketplaceFilters {
  origin: string;
  destination: string;
  cargoType: string;
  search: string;
  page: number;
}

interface LoadsResponse {
  data: { loads: Load[]; total: number; page: number; pages: number };
}

interface UseMarketplaceDataReturn {
  loads: Load[];
  total: number;
  pages: number;
  isLoading: boolean;
  acceptingId: string | null;
  filters: MarketplaceFilters;
  setFilter: <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => void;
  resetFilters: () => void;
  acceptLoad: (loadId: string) => void;
}

const DEFAULT_FILTERS: MarketplaceFilters = {
  origin: '',
  destination: '',
  cargoType: '',
  search: '',
  page: 1,
};

export function useMarketplaceData(pageSize = 12): UseMarketplaceDataReturn {
  const qc       = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [filters,     setFilters]     = useState<MarketplaceFilters>(DEFAULT_FILTERS);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<LoadsResponse>({
    queryKey: ['available-loads', filters.origin, filters.destination, filters.cargoType, filters.page],
    queryFn: () => {
      const params = new URLSearchParams({ limit: String(pageSize), page: String(filters.page) });
      if (filters.origin)      params.set('origin', filters.origin);
      if (filters.destination) params.set('destination', filters.destination);
      if (filters.cargoType)   params.set('cargoType', filters.cargoType);
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

  const setFilter = useCallback(<K extends keyof MarketplaceFilters>(
    key: K,
    value: MarketplaceFilters[K],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when any filter (not page itself) changes
      ...(key !== 'page' ? { page: 1 } : {}),
    }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const allLoads = data?.data.loads ?? [];
  const loads = allLoads.filter((l) => {
    const q = filters.search.toLowerCase();
    return (
      !q ||
      l.shortId.toLowerCase().includes(q) ||
      l.origin.toLowerCase().includes(q) ||
      l.destination.toLowerCase().includes(q) ||
      l.cargoType.toLowerCase().includes(q) ||
      (l.shipper?.company ?? l.shipper?.name ?? '').toLowerCase().includes(q)
    );
  });

  return {
    loads,
    total: data?.data.total ?? 0,
    pages: data?.data.pages ?? 1,
    isLoading,
    acceptingId,
    filters,
    setFilter,
    resetFilters,
    acceptLoad: acceptMut.mutate,
  };
}
