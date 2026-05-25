'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Package, Weight, Calendar, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { cn, STATUS_LABELS, STATUS_COLORS, formatDate } from '@/lib/utils';
import type { Load } from '@/types';

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-purple-600',
  'bg-teal-600',  'bg-cyan-600',   'bg-green-700',  'bg-emerald-600',
  'bg-pink-600',  'bg-rose-600',   'bg-orange-600', 'bg-amber-600',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

interface LoadCardProps {
  load: Load;
  /** If provided, renders an Accept button. Omit for shipper view. */
  onAccept?: (loadId: string) => void;
  isAccepting?: boolean;
  /** Navigate to this path on card click */
  detailHref?: string;
}

const LoadCard: React.FC<LoadCardProps> = ({ load, onAccept, isAccepting, detailHref }) => {
  const shipperName = load.shipper?.company || load.shipper?.name || 'Unknown Shipper';

  return (
    <div
      className={cn(
        'group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
        'transition-all duration-200 hover:shadow-md hover:border-[#1E3A8A]/20',
        detailHref && 'cursor-pointer',
      )}
    >
      {/* Status stripe */}
      <div
        className={cn(
          'h-1 w-full',
          load.status === 'POSTED'      && 'bg-blue-400',
          load.status === 'ACCEPTED'    && 'bg-indigo-400',
          load.status === 'IN_TRANSIT'  && 'bg-amber-400',
          load.status === 'DELIVERED'   && 'bg-green-500',
          load.status === 'CANCELLED'   && 'bg-gray-300',
          load.status === 'DISPUTED'    && 'bg-red-400',
        )}
      />

      <div className="p-5 space-y-4">

        {/* Header row: shipper + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0',
              avatarColor(shipperName),
            )}>
              {initials(shipperName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{shipperName}</p>
              <p className="text-[11px] text-gray-400 font-mono">{load.shortId}</p>
            </div>
          </div>
          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0', STATUS_COLORS[load.status])}>
            {STATUS_LABELS[load.status]}
          </span>
        </div>

        {/* Route */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0 text-center">
            <div className="flex items-center gap-1 justify-center mb-0.5">
              <div className="w-2 h-2 rounded-full bg-[#1E3A8A] shrink-0" />
            </div>
            <p className="text-xs font-bold text-[#1E3A8A] truncate">{load.origin.split(',')[0]}</p>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <ArrowRight size={14} className="text-gray-400" />
          </div>
          <div className="flex-1 min-w-0 text-center">
            <div className="flex items-center gap-1 justify-center mb-0.5">
              <div className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
            </div>
            <p className="text-xs font-bold text-[#16A34A] truncate">{load.destination.split(',')[0]}</p>
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg px-2 py-2">
            <Package size={12} className="text-gray-400" />
            <p className="text-[10px] text-gray-400">Cargo</p>
            <p className="text-xs font-semibold text-gray-800 text-center leading-tight">{load.cargoType}</p>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg px-2 py-2">
            <Weight size={12} className="text-gray-400" />
            <p className="text-[10px] text-gray-400">Weight</p>
            <p className="text-xs font-semibold text-gray-800">{load.weight}t</p>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg px-2 py-2">
            <Calendar size={12} className="text-gray-400" />
            <p className="text-[10px] text-gray-400">By</p>
            <p className="text-xs font-semibold text-gray-800">{formatDate(load.deliveryDate)}</p>
          </div>
        </div>

        {/* Notes snippet */}
        {load.notes && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">
            &ldquo;{load.notes}&rdquo;
          </p>
        )}

        {/* Vehicle preference */}
        {load.preferredVehicle && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={11} className="text-gray-400 shrink-0" />
            Preferred: <span className="font-medium text-gray-700">{load.preferredVehicle}</span>
          </div>
        )}

        {/* Actions */}
        {(onAccept || detailHref) && (
          <div className="flex gap-2 pt-1">
            {detailHref && (
              <Link
                href={detailHref}
                className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                View Details <ArrowRight size={11} />
              </Link>
            )}
            {onAccept && (
              <button
                onClick={() => onAccept(load.id)}
                disabled={isAccepting}
                aria-label={`Accept load ${load.shortId}`}
                className={cn(
                  'flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-colors',
                  'bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 disabled:opacity-60 disabled:cursor-not-allowed',
                )}
              >
                {isAccepting
                  ? <><Loader2 size={12} className="animate-spin" /> Accepting…</>
                  : <><CheckCircle2 size={13} /> Accept Load</>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadCard;
