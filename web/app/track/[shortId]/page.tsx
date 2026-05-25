'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Package, RefreshCw, Copy, Check, AlertCircle, Truck,
  MapPin, Calendar, Weight,
} from 'lucide-react';
import { cn, STATUS_LABELS, STATUS_COLORS, formatDateTime } from '@/lib/utils';
import RouteMap from '@/components/tracking/RouteMap';
import ProgressTimeline, { TimelineStep } from '@/components/tracking/ProgressTimeline';
import TrackingStatsBar from '@/components/tracking/TrackingStatsBar';
import type { Load } from '@/types';
import axios from 'axios';

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'POSTED',               label: 'Posted' },
  { key: 'ACCEPTED',             label: 'Accepted' },
  { key: 'PICKED_UP',            label: 'Picked Up' },
  { key: 'IN_TRANSIT',           label: 'In Transit' },
  { key: 'AWAITING_CONFIRMATION',label: 'At Destination' },
  { key: 'DELIVERED',            label: 'Delivered' },
];

interface PublicLoad extends Omit<Load, 'shipperId' | 'transporterId' | 'tenantId' | 'shipper' | 'transporter'> {
  shipper?: { company?: string; name?: string };
  transporter?: { vehicleType?: string; numberPlate?: string };
}

interface PublicTrackResponse {
  success: boolean;
  data: PublicLoad;
  error?: string;
}

function timestamps(load: PublicLoad): Record<string, string | undefined> {
  return {
    POSTED:                load.createdAt,
    ACCEPTED:              load.acceptedAt,
    PICKED_UP:             load.pickedUpAt,
    IN_TRANSIT:            load.inTransitAt,
    AWAITING_CONFIRMATION: load.deliveredAt,
    DELIVERED:             load.confirmedAt,
  };
}

export default function PublicTrackPage() {
  const { shortId } = useParams<{ shortId: string }>();
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied,       setCopied]       = useState(false);

  const { data, isLoading, error, dataUpdatedAt, refetch } = useQuery<PublicTrackResponse>({
    queryKey: ['public-track', shortId],
    queryFn: () => axios.get(`/api/track/${shortId}`).then((r) => r.data),
    refetchInterval: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refetch().then(() => { setIsRefreshing(false); setLastUpdated(new Date()); });
  }, [refetch]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const load = data?.data;

  // ─── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
        <PublicHeader />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-4 animate-pulse">
          <div className="h-24 bg-white rounded-xl border border-gray-200" />
          <div className="h-56 bg-white rounded-xl border border-gray-200" />
          <div className="h-48 bg-white rounded-xl border border-gray-200" />
        </main>
      </div>
    );
  }

  // ─── Error / not found ───────────────────────────────────────────────────
  if (error || !load) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h2 className="font-semibold text-gray-900">Tracking ID not found</h2>
            <p className="text-sm text-gray-500">
              <strong className="font-mono text-gray-700">{shortId}</strong> does not match any
              shipment. Check the tracking ID and try again.
            </p>
            <Link href="/" className="btn-primary w-full h-9 inline-flex items-center justify-center text-sm">
              Go to FreightFlow
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const shipperLabel = load.shipper?.company || load.shipper?.name || 'Shipper';

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-4">

        {/* ── Identity card ─────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center shrink-0">
                <Truck size={20} className="text-[#1E3A8A]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Tracking ID</p>
                <p className="text-base font-bold text-gray-900 font-mono tracking-wide">{load.shortId}</p>
                <p className="text-xs text-gray-500 mt-0.5">Shipped by <span className="font-medium">{shipperLabel}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border',
                STATUS_COLORS[load.status],
              )}>
                {STATUS_LABELS[load.status]}
              </span>
              <button
                onClick={handleCopy}
                aria-label="Copy tracking link"
                className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied ? <><Check size={12} className="text-green-500" /> Copied</> : <><Copy size={12} /> Share</>}
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                aria-label="Refresh tracking data"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Cargo meta */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Package,  label: 'Cargo',   value: load.cargoType },
              { icon: Weight,   label: 'Weight',  value: `${load.weight} tonnes` },
              { icon: Calendar, label: 'ETA',     value: new Date(load.deliveryDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) },
              { icon: MapPin,   label: 'Last Seen', value: load.lastLocation || 'Not yet reported' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col gap-1 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5">
                  <Icon size={11} className="text-gray-400" />
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats bar ─────────────────────────────────── */}
        <TrackingStatsBar
          status={load.status}
          deliveryDate={load.deliveryDate}
          origin={load.origin}
          destination={load.destination}
          lastLocation={load.lastLocation}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
        />

        {/* ── Route map ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Route</h3>
          <RouteMap
            origin={load.origin}
            destination={load.destination}
            status={load.status}
            lastLocation={load.lastLocation}
            lastUpdated={lastUpdated}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* ── Progress timeline ─────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Shipment Progress</h3>
          <ProgressTimeline
            steps={TIMELINE_STEPS}
            currentStatus={load.status}
            timestamps={timestamps(load)}
            statusLogs={load.statusLogs}
            formatDateTime={formatDateTime}
          />
        </div>

        {/* ── Transporter info ──────────────────────────── */}
        {load.transporter && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <Truck size={16} className="text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Assigned Transporter</p>
              <p className="text-sm font-semibold text-gray-900">
                {load.transporter.vehicleType ?? 'Vehicle'}
                {load.transporter.numberPlate && (
                  <span className="ml-2 text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {load.transporter.numberPlate}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── Footer note ───────────────────────────────── */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by{' '}
          <Link href="/" className="text-[#1E3A8A] hover:underline font-medium">
            FreightFlow
          </Link>
          {' '}— Digital Freight Marketplace for Africa
        </p>
      </main>
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#1E3A8A] flex items-center justify-center">
          <Truck size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-gray-900">FreightFlow</span>
      </Link>
      <span className="text-xs text-gray-400">Shipment Tracking</span>
    </header>
  );
}
