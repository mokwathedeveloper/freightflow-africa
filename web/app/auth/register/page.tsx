'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VEHICLE_TYPES } from '@/constants';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';
import Link from 'next/link';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z
      .string()
      .regex(/^\+254[17]\d{8}$/, 'Format: +254XXXXXXXXX (e.g. +254712345678)'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    company: z.string().optional(),
    vehicleType: z.string().optional(),
    numberPlate: z.string().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
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
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedRole');
    const allowed: ('SHIPPER' | 'TRANSPORTER')[] = ['SHIPPER', 'TRANSPORTER'];
    if (!stored || !allowed.includes(stored as 'SHIPPER' | 'TRANSPORTER')) {
      router.replace('/auth/role');
    } else {
      setRole(stored as 'SHIPPER' | 'TRANSPORTER');
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

  const passwordValue = watch('password', '');
  const strength = getPasswordStrength(passwordValue);

  if (!role) return null;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A8A] rounded-xl mb-3 shadow-md">
            <Truck className="text-white" size={22} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registering as a{' '}
            <span className="font-semibold text-[#1E3A8A] capitalize">{role.toLowerCase()}</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            {/* Full Name */}
            <div>
              <label className="ff-label">Full Name</label>
              <input
                {...register('name')}
                placeholder="e.g. John Kamau"
                className={cn('ff-input', errors.name && 'ff-input-error')}
              />
              {errors.name && <p className="ff-error">{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="ff-label">Phone Number</label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+254712345678"
                className={cn('ff-input', errors.phone && 'ff-input-error')}
              />
              {errors.phone && <p className="ff-error">{errors.phone.message}</p>}
            </div>

            {/* Email (optional for both roles) */}
            <div>
              <label className="ff-label">Email Address <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                {...register('email')}
                type="email"
                placeholder="john@example.com"
                className={cn('ff-input', errors.email && 'ff-input-error')}
              />
              {errors.email && <p className="ff-error">{errors.email.message}</p>}
            </div>

            {/* Shipper-only: Company */}
            {role === 'SHIPPER' && (
              <div>
                <label className="ff-label">Company Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  {...register('company')}
                  placeholder="ABC Logistics Ltd"
                  className="ff-input"
                />
              </div>
            )}

            {/* Transporter-only: Vehicle + Plate */}
            {role === 'TRANSPORTER' && (
              <>
                <div>
                  <label className="ff-label">Vehicle Type</label>
                  <select
                    {...register('vehicleType')}
                    className={cn('ff-input', errors.vehicleType && 'ff-input-error')}
                  >
                    <option value="">Select vehicle type</option>
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  {errors.vehicleType && <p className="ff-error">{errors.vehicleType.message}</p>}
                </div>

                <div>
                  <label className="ff-label">Number Plate</label>
                  <input
                    {...register('numberPlate')}
                    placeholder="KAA 123A"
                    className={cn('ff-input uppercase', errors.numberPlate && 'ff-input-error')}
                  />
                  {errors.numberPlate && <p className="ff-error">{errors.numberPlate.message}</p>}
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="ff-label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className={cn('ff-input pr-10', errors.password && 'ff-input-error')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="ff-error">{errors.password.message}</p>}
              {/* Strength indicator */}
              {passwordValue && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          strength >= level
                            ? level === 1 ? 'bg-red-500' : level === 2 ? 'bg-amber-400' : 'bg-green-500'
                            : 'bg-gray-200'
                        )}
                      />
                    ))}
                  </div>
                  <span className={cn('text-xs', strength === 1 && 'text-red-500', strength === 2 && 'text-amber-500', strength === 3 && 'text-green-600')}>
                    {strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="ff-label">Confirm Password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className={cn('ff-input pr-10', errors.confirmPassword && 'ff-input-error')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="ff-error">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-10 mt-1"
            >
              {loading ? <><Loader2 className="animate-spin" size={15} /> Sending code...</> : 'Send Verification Code'}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between mt-4 px-1">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <Link href="/auth/login" className="text-sm text-[#1E3A8A] hover:underline">
            Already have an account?
          </Link>
        </div>
      </div>
    </main>
  );
}

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.max(score, password.length >= 8 ? 1 : 0);
}
