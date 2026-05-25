'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
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

interface RouteMapProps {
  origin: string;
  destination: string;
  status: LoadStatus;
  lastLocation?: string;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const RouteMap: React.FC<RouteMapProps> = ({
  origin,
  destination,
  status,
  lastLocation,
  lastUpdated,
  onRefresh,
  isRefreshing,
}) => {
  const progress = PROGRESS_MAP[status] ?? 0;
  const isDelivered = status === 'DELIVERED';
  const isActive = progress > 0 && progress < 1;

  const W = 380, H = 200;
  const ox = 44, oy = 164;
  const dx = 336, dy = 38;
  const mx = (ox + dx) / 2;
  const my = Math.min(oy, dy) - 52;

  const pathD =
    `M ${ox} ${oy} ` +
    `C ${ox + (mx - ox) * 0.4} ${oy + (my - oy) * 0.3 + 12}, ` +
    `${mx - 20} ${my + 8}, ${mx} ${my} ` +
    `S ${mx + (dx - mx) * 0.65} ${my + (dy - my) * 0.45 - 8}, ${dx} ${dy}`;

  const progX = ox + (dx - ox) * progress;
  const progY =
    oy + (dy - oy) * progress - Math.sin(Math.PI * progress) * 65;

  function formatUpdated(d: Date) {
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="space-y-2">
      <div
        className="bg-[#EEF3FB] rounded-xl overflow-hidden border border-[#D1DCF0] relative"
        style={{ height: 224 }}
        role="img"
        aria-label={`Route map from ${origin} to ${destination}, ${Math.round(progress * 100)}% complete`}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full"
          style={{ maxHeight: 224 }}
          aria-hidden="true"
        >
          {/* Grid */}
          {[40, 80, 120, 160].map((y) => (
            <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#E2E8F0" strokeWidth="0.6" />
          ))}
          {[76, 152, 228, 304].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2={H} stroke="#E2E8F0" strokeWidth="0.6" />
          ))}

          {/* Route — dashed grey */}
          <path
            d={pathD}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="4"
            strokeDasharray="9 5"
            strokeLinecap="round"
          />

          {/* Route — completed solid navy */}
          {progress > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke="#1E3A8A"
              strokeWidth="3.5"
              strokeDasharray={`${progress * 680} 680`}
              strokeLinecap="round"
            />
          )}

          {/* Origin pin */}
          <circle cx={ox} cy={oy} r="9" fill="#1E3A8A" />
          <circle cx={ox} cy={oy} r="4.5" fill="white" />
          <text
            x={ox}
            y={oy + 20}
            textAnchor="middle"
            fill="#1E3A8A"
            fontSize="10"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {origin.split(',')[0].substring(0, 12)}
          </text>

          {/* Destination pin */}
          <circle cx={dx} cy={dy} r="9" fill={isDelivered ? '#16A34A' : '#9CA3AF'} />
          <circle cx={dx} cy={dy} r="4.5" fill="white" />
          <text
            x={dx}
            y={dy - 15}
            textAnchor="middle"
            fill={isDelivered ? '#16A34A' : '#6B7280'}
            fontSize="10"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            {destination.split(',')[0].substring(0, 12)}
          </text>

          {/* Truck marker (active only) */}
          {isActive && (
            <>
              <circle cx={progX} cy={progY} r="14" fill="#1E3A8A" opacity="0.12" />
              <circle cx={progX} cy={progY} r="10" fill="#1E3A8A" />
              <text
                x={progX}
                y={progY + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontFamily="system-ui, sans-serif"
              >
                🚛
              </text>
            </>
          )}

          {/* Delivered checkmark */}
          {isDelivered && (
            <>
              <circle cx={dx} cy={dy} r="14" fill="#16A34A" opacity="0.15" />
              <text
                x={dx}
                y={dy + 5}
                textAnchor="middle"
                fill="#16A34A"
                fontSize="13"
                fontFamily="system-ui, sans-serif"
              >
                ✓
              </text>
            </>
          )}

          {/* Progress label */}
          <text
            x={W / 2}
            y={H - 5}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="9"
            fontFamily="system-ui, sans-serif"
          >
            {Math.round(progress * 100)}% of route completed
          </text>
        </svg>

        {/* Refresh overlay button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh location"
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#1E3A8A] hover:border-[#1E3A8A]/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-0.5">
        {lastLocation ? (
          <span className="truncate max-w-[60%]">
            📍 Last seen: <span className="text-gray-600 font-medium">{lastLocation}</span>
          </span>
        ) : (
          <span />
        )}
        {lastUpdated && (
          <span>Updated {formatUpdated(lastUpdated)}</span>
        )}
      </div>
    </div>
  );
};

export default RouteMap;
