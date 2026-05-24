'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VEHICLE_TYPES } from '@/constants';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

const baseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^\+254[17]\d{8}$/, 'Phone must be in format +254XXXXXXXXX'),
  email: z.email('Invalid email address').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  company: z.string().optional(),
  vehicleType: z.string().optional(),
  numberPlate: z.string().optional(),
});

const schema = baseSchema.refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [role, setRole] = useState<'SHIPPER' | 'TRANSPORTER' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedRole') as 'SHIPPER' | 'TRANSPORTER' | null;
    if (!stored) {
      router.replace('/auth/role');
    } else {
      setRole(stored);
    }
  }, [router]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        role,
        company: data.company || undefined,
        vehicleType: data.vehicleType || undefined,
        numberPlate: data.numberPlate || undefined,
      });
      addToast('success', 'OTP sent to ' + data.phone);
      sessionStorage.setItem('verifyPhone', data.phone);
      router.push('/auth/verify');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Registration failed. Please try again.';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  }

  if (!role) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-xl mb-3">
            <Truck className="text-primary-foreground" size={20} />
          </div>
          <h1 className="text-xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registering as a{' '}
            <span className="font-medium capitalize text-foreground">{role.toLowerCase()}</span>
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Full Name" error={errors.name?.message}>
              <input
                {...register('name')}
                placeholder="John Kamau"
                className={inputClass(!!errors.name)}
              />
            </Field>

            <Field label="Phone Number" error={errors.phone?.message}>
              <input
                {...register('phone')}
                placeholder="+254712345678"
                type="tel"
                className={inputClass(!!errors.phone)}
              />
            </Field>

            <Field label="Email (optional)" error={errors.email?.message}>
              <input
                {...register('email')}
                placeholder="john@example.com"
                type="email"
                className={inputClass(!!errors.email)}
              />
            </Field>

            {role === 'SHIPPER' && (
              <Field label="Company Name (optional)" error={undefined}>
                <input
                  {...register('company')}
                  placeholder="ABC Logistics Ltd"
                  className={inputClass(false)}
                />
              </Field>
            )}

            {role === 'TRANSPORTER' && (
              <>
                <Field label="Vehicle Type" error={errors.vehicleType?.message}>
                  <select {...register('vehicleType')} className={inputClass(!!errors.vehicleType)}>
                    <option value="">Select vehicle type</option>
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Number Plate" error={errors.numberPlate?.message}>
                  <input
                    {...register('numberPlate')}
                    placeholder="KAA 123A"
                    className={inputClass(!!errors.numberPlate)}
                  />
                </Field>
              </>
            )}

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={cn(inputClass(!!errors.password), 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword?.message}>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat password"
                  className={cn(inputClass(!!errors.confirmPassword), 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground px-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <a href="/auth/login" className="text-primary hover:underline">
            Already have an account?
          </a>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full h-10 rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors',
    'focus:border-primary focus:ring-2 focus:ring-primary/20',
    hasError ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border'
  );
}
