'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Truck, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

const phoneSchema = z.object({
  phone: z.string().regex(/^\+254[17]\d{8}$/, 'Format: +254XXXXXXXXX'),
});

const resetSchema = z
  .object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string().min(8, 'Min. 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PhoneForm = z.infer<typeof phoneSchema>;
type ResetForm = z.infer<typeof resetSchema>;

type Step = 'phone' | 'reset' | 'done';

export default function ResetPage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });

  async function onPhoneSubmit(data: PhoneForm) {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { phone: data.phone });
      setPhone(data.phone);
      setStep('reset');
      addToast('info', 'If that number is registered, you will receive an OTP shortly.');
    } catch {
      addToast('error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function onResetSubmit(data: ResetForm) {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        phone,
        otp: data.otp,
        newPassword: data.password,
      });
      setStep('done');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Invalid or expired OTP.';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-xl mb-3">
            <Truck className="text-primary-foreground" size={20} />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {step === 'done' ? 'Password reset!' : 'Reset password'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 'phone' && 'Enter your phone number to receive an OTP'}
            {step === 'reset' && `Enter the OTP sent to ${phone}`}
            {step === 'done' && 'Your password has been updated successfully'}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          {step === 'phone' && (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <input
                  {...phoneForm.register('phone')}
                  type="tel"
                  placeholder="+254712345678"
                  className={cn(
                    'w-full h-10 rounded-lg border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors',
                    'focus:border-primary focus:ring-2 focus:ring-primary/20',
                    phoneForm.formState.errors.phone ? 'border-destructive' : 'border-border'
                  )}
                />
                {phoneForm.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full h-10">
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <Field label="OTP Code" error={resetForm.formState.errors.otp?.message}>
                <input
                  {...resetForm.register('otp')}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  className={inputClass(!!resetForm.formState.errors.otp)}
                />
              </Field>

              <Field label="New Password" error={resetForm.formState.errors.password?.message}>
                <div className="relative">
                  <input
                    {...resetForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    className={cn(inputClass(!!resetForm.formState.errors.password), 'pr-10')}
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

              <Field
                label="Confirm Password"
                error={resetForm.formState.errors.confirmPassword?.message}
              >
                <input
                  {...resetForm.register('confirmPassword')}
                  type="password"
                  placeholder="Repeat password"
                  className={inputClass(!!resetForm.formState.errors.confirmPassword)}
                />
              </Field>

              <Button type="submit" disabled={loading} className="w-full h-10">
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Reset Password'}
              </Button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center py-4 space-y-4">
              <CheckCircle className="mx-auto text-green-500" size={48} />
              <p className="text-sm text-muted-foreground">
                You can now sign in with your new password.
              </p>
              <Button onClick={() => router.push('/auth/login')} className="w-full h-10">
                Go to Login
              </Button>
            </div>
          )}
        </div>

        {step !== 'done' && (
          <button
            onClick={() => (step === 'reset' ? setStep('phone') : router.push('/auth/login'))}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 mx-auto"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
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
    hasError ? 'border-destructive' : 'border-border'
  );
}
