'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToastStore } from '@/store/toast.store';
import Link from 'next/link';
import type { User } from '@/types';

const schema = z.object({
  phone:    z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const { data: res } = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data as {
        user: User; accessToken: string; refreshToken: string;
      };
      setAuth(user, accessToken, refreshToken);
      addToast('success', `Welcome back, ${user.name.split(' ')[0]}!`);
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Login failed. Check your credentials and try again.';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A8A] rounded-xl mb-4 shadow-lg">
            <Truck className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your FreightFlow account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Link href="/auth/reset" className="text-xs text-[#1E3A8A] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
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
            </div>

            <Button type="submit" disabled={loading} className="w-full h-10 mt-1">
              {loading ? <><Loader2 className="animate-spin" size={15} /> Signing in...</> : 'Sign In'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/auth/role" className="text-[#1E3A8A] font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
