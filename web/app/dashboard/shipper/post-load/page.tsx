'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowRight, MapPin, Clock, Route, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARGO_TYPES, VEHICLE_TYPES, KENYAN_CITIES } from '@/constants';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

const schema = z.object({
  origin:           z.string().min(1, 'Origin is required'),
  destination:      z.string().min(1, 'Destination is required'),
  cargoType:        z.string().min(1, 'Cargo type is required'),
  weight:           z.coerce.number().positive('Weight must be greater than 0'),
  deliveryDate:     z.string().min(1, 'Delivery date is required'),
  notes:            z.string().optional(),
  preferredVehicle: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// Rough distance estimates (km) between major Kenyan cities
const DISTANCES: Record<string, Record<string, number>> = {
  Nairobi:  { Mombasa: 480, Kisumu: 340, Nakuru: 160, Eldoret: 310, Thika: 45, Malindi: 565, Kitale: 375, Garissa: 370, Nyeri: 155, Meru: 215, Machakos: 65 },
  Mombasa:  { Nairobi: 480, Kisumu: 820, Nakuru: 640, Malindi: 120, Garissa: 490 },
  Kisumu:   { Nairobi: 340, Mombasa: 820, Nakuru: 180, Eldoret: 110, Kitale: 130 },
  Nakuru:   { Nairobi: 160, Kisumu: 180, Eldoret: 155, Kitale: 200 },
  Eldoret:  { Nairobi: 310, Kisumu: 110, Nakuru: 155, Kitale: 65 },
};

function getDistance(a: string, b: string): number | null {
  return DISTANCES[a]?.[b] ?? DISTANCES[b]?.[a] ?? null;
}

function getTransitDays(km: number): string {
  if (km < 100) return '4–8 hrs';
  if (km < 300) return '6–12 hrs';
  if (km < 500) return '1–2 days';
  return '2–3 days';
}

export default function PostLoadPage() {
  const router  = useRouter();
  const qc      = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as Resolver<FormData> });

  const origin      = watch('origin');
  const destination = watch('destination');
  const weight      = watch('weight');
  const cargoType   = watch('cargoType');

  const distance = origin && destination ? getDistance(origin, destination) : null;

  async function onSubmit(data: FormData) {
    if (data.origin === data.destination) {
      addToast('error', 'Origin and destination cannot be the same');
      return;
    }
    setLoading(true);
    try {
      await api.post('/loads', data);
      await qc.invalidateQueries({ queryKey: ['shipper-loads'] });
      addToast('success', 'Load posted! Transporters will be notified via SMS.');
      router.push('/dashboard/shipper/shipments');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to post load.';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Post a New Load</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Matching transporters will be notified via SMS instantly after posting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT: Form ────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">

              {/* Route */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-[#1E3A8A]" /> Route Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="ff-label">Origin City</label>
                    <select {...register('origin')} className={cn('ff-input', errors.origin && 'ff-input-error')}>
                      <option value="">Select origin</option>
                      {KENYAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.origin && <p className="ff-error">{errors.origin.message}</p>}
                  </div>
                  <div>
                    <label className="ff-label">Destination City</label>
                    <select {...register('destination')} className={cn('ff-input', errors.destination && 'ff-input-error')}>
                      <option value="">Select destination</option>
                      {KENYAN_CITIES.filter((c) => c !== origin).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.destination && <p className="ff-error">{errors.destination.message}</p>}
                  </div>
                </div>
              </div>

              {/* Cargo */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Cargo Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="ff-label">Cargo Type</label>
                    <select {...register('cargoType')} className={cn('ff-input', errors.cargoType && 'ff-input-error')}>
                      <option value="">Select cargo type</option>
                      {CARGO_TYPES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.cargoType && <p className="ff-error">{errors.cargoType.message}</p>}
                  </div>
                  <div>
                    <label className="ff-label">Weight (tonnes)</label>
                    <input
                      {...register('weight')}
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="e.g. 2.5"
                      className={cn('ff-input', errors.weight && 'ff-input-error')}
                    />
                    {errors.weight && <p className="ff-error">{errors.weight.message}</p>}
                  </div>
                </div>
              </div>

              {/* Logistics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Logistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="ff-label">Required by Date</label>
                    <input
                      {...register('deliveryDate')}
                      type="date"
                      min={minDate}
                      className={cn('ff-input', errors.deliveryDate && 'ff-input-error')}
                    />
                    {errors.deliveryDate && <p className="ff-error">{errors.deliveryDate.message}</p>}
                  </div>
                  <div>
                    <label className="ff-label">Preferred Vehicle <span className="text-gray-400 font-normal">(optional)</span></label>
                    <select {...register('preferredVehicle')} className="ff-input">
                      <option value="">Any vehicle type</option>
                      {VEHICLE_TYPES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="ff-label">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  {...register('notes')}
                  placeholder="Special instructions, fragile items, access restrictions..."
                  rows={3}
                  className="ff-input h-auto resize-none py-2.5"
                />
              </div>

              {/* SMS notice */}
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                <MessageSquare size={15} className="mt-0.5 shrink-0" />
                <span><strong>SMS Notification:</strong> Matching transporters will receive an SMS alert immediately after posting.</span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary px-5 h-10"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 h-10">
                  {loading
                    ? <><Loader2 className="animate-spin" size={15} /> Posting...</>
                    : 'Post Load & Notify Transporters'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Route Preview ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Route visual */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Route Preview</h3>

            {origin && destination ? (
              <>
                {/* Route map placeholder */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg h-40 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, #1E3A8A 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                  />
                  <div className="flex items-center gap-3 z-10">
                    <div className="text-center">
                      <div className="w-3 h-3 rounded-full bg-[#1E3A8A] mx-auto mb-1" />
                      <p className="text-xs font-semibold text-[#1E3A8A]">{origin}</p>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-[#1E3A8A]/40 w-16 relative">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <ArrowRight size={14} className="text-[#1E3A8A]" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-green-700">{destination}</p>
                    </div>
                  </div>
                </div>

                {/* Route stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Route,   label: 'Distance',  value: distance ? `~${distance} km` : 'N/A' },
                    { icon: Clock,   label: 'Est. Transit', value: distance ? getTransitDays(distance) : 'N/A' },
                    { icon: MapPin,  label: 'Route',      value: 'Road' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-center p-2 bg-gray-50 rounded-lg">
                      <Icon size={14} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-gray-50 rounded-lg h-40 flex items-center justify-center text-center px-4">
                <div>
                  <MapPin size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Select origin and destination to preview route</p>
                </div>
              </div>
            )}
          </div>

          {/* Load Summary */}
          {(cargoType || weight) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Load Summary</h3>
              <div className="space-y-2 text-sm">
                {cargoType && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cargo Type</span>
                    <span className="font-medium text-gray-900">{cargoType}</span>
                  </div>
                )}
                {weight > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Weight</span>
                    <span className="font-medium text-gray-900">{weight} tonnes</span>
                  </div>
                )}
                {origin && destination && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Route</span>
                    <span className="font-medium text-gray-900">{origin} → {destination}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-[#1E3A8A]/5 border border-[#1E3A8A]/10 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-[#1E3A8A] mb-2">Tips for faster matching</h4>
            <ul className="space-y-1.5">
              {[
                'Add clear notes for special cargo handling',
                'Set a realistic delivery date',
                'Specify preferred vehicle if you have requirements',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="text-[#1E3A8A] font-bold mt-0.5">·</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
