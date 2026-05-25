import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import type { Load } from '@/types';

interface UseCargoTrackingReturn {
  load: Load | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refetch: () => void;
}

export function useCargoTracking(loadId: string): UseCargoTrackingReturn {
  const qc = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, dataUpdatedAt } = useQuery<{ data: Load }>({
    queryKey: ['load', loadId],
    queryFn: () => api.get(`/loads/${loadId}`).then((r) => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    qc.invalidateQueries({ queryKey: ['load', loadId] }).then(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    });
  }, [qc, loadId]);

  return {
    load: data?.data,
    isLoading,
    isRefreshing,
    lastUpdated,
    refetch,
  };
}
