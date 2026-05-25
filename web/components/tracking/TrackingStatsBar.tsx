'use client';

import React from 'react';
import { Clock, TrendingUp, MapPin, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LoadStatus } from '@/types';

const PROGRESS_MAP: Record<string, number> = {
  POSTED: 0,
  ACCEPTED: 0.08,
  PICKED_UP: 0.25,
  IN_TRANSIT: 0.62,
  AWAITING_CONFIRMATION: 0.92,
  DELIVERED: 1,
  DISPUTED: 0.92,
  CANCELLED: 0,
};

interface TrackingStatsBarProps {
  status: LoadStatus;
  deliveryDate: string;
  origin: string;
  destination: string;
  lastLocation?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

function formatETA(deliveryDateStr: string): { label: string; urgent: boolean } {
  const now = new Date();
  const eta = new Date(deliveryDateStr);
  const diffMs = eta.getTime() - now.getTime();
  if (diffMs < 0) return { label: 'Overdue', urgent: true };
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);
  if (diffD > 1) return { label: `${diffD} days`, urgent: false };
  if (diffH >= 1) return { label: `${diffH}h`, urgent: diffH < 4 };
  const diffM = Math.floor(diffMs / 60000);
  return { label: `${diffM}m`, urgent: true };
}

const TrackingStatsBar: React.FC<TrackingStatsBarProps> = ({
  status,
  deliveryDate,
  origin,
  destination,
  lastLocation,
  isRefreshing,
  onRefresh,
}) => {
  const progress = PROGRESS_MAP[status] ?? 0;
  const { label: etaLabel, urgent: etaUrgent } = formatETA(deliveryDate);
  const isDelivered = status === 'DELIVERED' || status === 'CANCELLED';

  const stats: { icon: React.ReactNode; label: string; value: string; accent?: boolean }[] = [
    {
      icon: <Clock size={13} className={etaUrgent ? 'text-amber-500' : 'text-[#1E3A8A]'} />,
      label: isDelivered ? 'Delivery Date' : 'ETA',
      value: isDelivered
        ? new Date(deliveryDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
        : etaLabel,
      accent: etaUrgent && !isDelivered,
    },
    {
      icon: <TrendingUp size={13} className="text-[#16A34A]" />,
      label: 'Progress',
      value: `${Math.round(progress * 100)}%`,
    },
    {
      icon: <MapPin size={13} className="text-purple-500" />,
      label: 'Route',
      value: `${origin.split(',')[0]} → ${destination.split(',')[0]}`,
    },
  ];

  if (lastLocation) {
    stats.push({
      icon: <MapPin size={13} className="text-amber-500" />,
      label: 'Last Seen',
      value: lastLocation,
    });
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-stretch divide-x divide-gray-100 overflow-x-auto">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex-1 min-w-[90px] px-4 py-3 flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5">
              {s.icon}
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                {s.label}
              </span>
            </div>
            <p
              className={cn(
                'text-sm font-bold truncate',
                s.accent ? 'text-amber-600' : 'text-gray-900',
              )}
            >
              {s.value}
            </p>
          </div>
        ))}

        {/* Refresh button cell */}
        {onRefresh && (
          <div className="px-3 flex items-center shrink-0">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh tracking data"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1E3A8A] hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>

      {/* Live indicator strip */}
      <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 rounded-b-xl flex items-center gap-2">
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            isRefreshing ? 'bg-amber-400 animate-pulse' : 'bg-[#16A34A] animate-pulse',
          )}
        />
        <span className="text-[10px] text-gray-400">
          {isRefreshing ? 'Refreshing...' : 'Live tracking — auto-refreshes every 30s'}
        </span>
      </div>
    </div>
  );
};

export default TrackingStatsBar;
