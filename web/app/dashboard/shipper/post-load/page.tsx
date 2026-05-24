'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Page header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Post a New Load</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Matching transporters will be notified via SMS instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-5">

          {/* Route */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Route Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="ff-label">Origin City</label>
                <select {...register('origin')} className={cn('ff-input', errors.origin && 'ff-input-error')}>
                  <option value="">Select origin city</option>
                  {KENYAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.origin && <p className="ff-error">{errors.origin.message}</p>}
              </div>

              <div>
                <label className="ff-label">Destination City</label>
                <select {...register('destination')} className={cn('ff-input', errors.destination && 'ff-input-error')}>
                  <option value="">Select destination city</option>
                  {KENYAN_CITIES.filter((c) => c !== origin).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.destination && <p className="ff-error">{errors.destination.message}</p>}
              </div>
            </div>

            {origin && destination && (
              <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-[#1E3A8A]">
                <MapPin size={14} />
                <strong>{origin}</strong>
                <ArrowRight size={14} />
                <strong>{destination}</strong>
              </div>
            )}
          </div>

          {/* Cargo */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cargo Details</h3>
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
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Logistics</h3>
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
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            <strong>SMS Notification:</strong> Matching transporters will receive an SMS alert immediately after posting.
          </div>

          <Button type="submit" disabled={loading} className="w-full h-10">
            {loading
              ? <><Loader2 className="animate-spin" size={16} /> Posting...</>
              : 'Post Load & Notify Transporters'}
          </Button>
        </div>
      </form>
    </div>
  );
}
