'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CARGO_TYPES, VEHICLE_TYPES, KENYAN_CITIES } from '@/constants';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

const schema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  cargoType: z.string().min(1, 'Cargo type is required'),
  weight: z.coerce.number().positive('Weight must be > 0'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  notes: z.string().optional(),
  preferredVehicle: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PostLoadPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as Resolver<FormData> });

  const origin = watch('origin');
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
    <div className="max-w-xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Post a New Load</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Transporters will be notified via SMS when you post.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Origin" error={errors.origin?.message}>
            <select {...register('origin')} className={sel(!!errors.origin)}>
              <option value="">Select city</option>
              {KENYAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Destination" error={errors.destination?.message}>
            <select {...register('destination')} className={sel(!!errors.destination)}>
              <option value="">Select city</option>
              {KENYAN_CITIES.filter((c) => c !== origin).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Cargo Type" error={errors.cargoType?.message}>
            <select {...register('cargoType')} className={sel(!!errors.cargoType)}>
              <option value="">Select type</option>
              {CARGO_TYPES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Weight (tonnes)" error={errors.weight?.message}>
            <input
              {...register('weight')}
              type="number"
              step="0.1"
              min="0.1"
              placeholder="e.g. 2.5"
              className={inp(!!errors.weight)}
            />
          </Field>
        </div>

        <Field label="Required by Date" error={errors.deliveryDate?.message}>
          <input
            {...register('deliveryDate')}
            type="date"
            min={minDate}
            className={inp(!!errors.deliveryDate)}
          />
        </Field>

        <Field label="Preferred Vehicle (optional)" error={undefined}>
          <select {...register('preferredVehicle')} className={sel(false)}>
            <option value="">Any vehicle</option>
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>

        <Field label="Notes (optional)" error={undefined}>
          <textarea
            {...register('notes')}
            placeholder="Special instructions, fragile items, access restrictions..."
            rows={3}
            className={cn(inp(false), 'h-auto resize-none py-2')}
          />
        </Field>

        {origin && destination && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
            Route: <strong>{origin} → {destination}</strong>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full h-10">
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'Post Load & Notify Transporters'}
        </Button>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

const base = 'w-full h-10 rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';
const inp = (err: boolean) => cn(base, err ? 'border-destructive' : 'border-border');
const sel = (err: boolean) => cn(base, err ? 'border-destructive' : 'border-border');
