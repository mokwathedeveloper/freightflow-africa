'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

// ─── Step schemas ────────────────────────────────────────────────────────────
const phoneSchema = z.object({
  phone: z.string().regex(/^\+254[17]\d{8}$/, 'Format: +254XXXXXXXXX'),
});
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Min. 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PhoneForm = z.infer<typeof phoneSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 4)} *** *** ${phone.slice(-3)}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResetPage() {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  type Step = 'phone' | 'otp' | 'password' | 'done';
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP state
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  // ── Step 1: send OTP ────────────────────────────────────────────────────────
  async function onPhoneSubmit(data: PhoneForm) {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { phone: data.phone });
      setPhone(data.phone);
      startCountdown();
      setStep('otp');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      addToast('error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── OTP helpers ─────────────────────────────────────────────────────────────
  function startCountdown() {
    setCountdown(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (paste.length === OTP_LENGTH) {
      setDigits(paste.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
    e.preventDefault();
  }

  async function handleResend() {
    setResending(true);
    try {
      await api.post('/auth/forgot-password', { phone });
      setDigits(Array(OTP_LENGTH).fill(''));
      startCountdown();
      inputRefs.current[0]?.focus();
      addToast('info', 'New reset code sent');
    } catch {
      addToast('error', 'Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  }

  // ── Step 2: verify OTP ──────────────────────────────────────────────────────
  async function handleVerifyOtp() {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) {
      addToast('error', 'Please enter the full 6-digit code');
      return;
    }
    // Store OTP and advance to password step (OTP will be verified on final submit)
    setOtp(code);
    setStep('password');
  }

  // ── Step 3: set new password ────────────────────────────────────────────────
  async function onPasswordSubmit(data: PasswordForm) {
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        phone,
        otp,
        newPassword: data.password,
      });
      setStep('done');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Invalid or expired code. Please start over.';
      addToast('error', msg);
      // Send back to OTP step if the code was wrong
      setStep('otp');
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }

  const otpComplete = digits.join('').length === OTP_LENGTH;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Icon + heading */}
        <div className="text-center mb-6">
          {step === 'done' ? (
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-2xl mb-4">
              <CheckCircle className="text-green-600" size={28} />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
              <ShieldCheck className="text-[#1E3A8A]" size={28} />
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {step === 'phone' && 'Forgot password?'}
            {step === 'otp' && 'Verify your number'}
            {step === 'password' && 'Set new password'}
            {step === 'done' && 'Password updated!'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 'phone' && "Enter your registered phone. We'll send a reset code."}
            {step === 'otp' && <>Enter the 6-digit code sent to <span className="font-semibold text-gray-700">{maskPhone(phone)}</span></>}
            {step === 'password' && 'Choose a strong new password.'}
            {step === 'done' && 'You can now sign in with your new password.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

          {/* Step 1 — Phone */}
          {step === 'phone' && (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="ff-label">Phone Number</label>
                <input
                  {...phoneForm.register('phone')}
                  type="tel"
                  placeholder="+254712345678"
                  className={cn('ff-input', phoneForm.formState.errors.phone && 'ff-input-error')}
                />
                {phoneForm.formState.errors.phone && (
                  <p className="ff-error">{phoneForm.formState.errors.phone.message}</p>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full h-10">
                {loading ? <><Loader2 className="animate-spin" size={15} /> Sending...</> : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div
                className="flex items-center justify-center gap-2"
                onPaste={handlePaste}
              >
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 text-center text-lg font-bold text-gray-900 bg-white',
                      'outline-none transition-colors',
                      'focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/20',
                      d ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-300'
                    )}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={!otpComplete}
                className="btn-primary w-full h-10"
              >
                Verify Code
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend code in{' '}
                    <span className="font-semibold text-gray-700 tabular-nums">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-sm text-[#1E3A8A] font-medium hover:underline disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {resending && <Loader2 className="animate-spin" size={12} />}
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3 — New password */}
          {step === 'password' && (
            <PasswordStep
              form={passwordForm}
              loading={loading}
              onSubmit={onPasswordSubmit}
            />
          )}

          {/* Done */}
          {step === 'done' && (
            <button
              onClick={() => router.push('/auth/login')}
              className="btn-primary w-full h-10"
            >
              Back to Login
            </button>
          )}
        </div>

        {/* Back link */}
        {step !== 'done' && (
          <button
            onClick={() => {
              if (step === 'otp') setStep('phone');
              else if (step === 'password') setStep('otp');
              else router.push('/auth/login');
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors mt-4 mx-auto"
          >
            <ArrowLeft size={14} />
            {step === 'phone' ? 'Back to login' : 'Back'}
          </button>
        )}
      </div>
    </main>
  );
}

// ─── Password step sub-component ─────────────────────────────────────────────
function PasswordStep({
  form,
  loading,
  onSubmit,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  loading: boolean;
  onSubmit: (d: { password: string; confirmPassword: string }) => void;
}) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="ff-label">New Password</label>
        <div className="relative">
          <input
            {...register('password')}
            type={showNew ? 'text' : 'password'}
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
            className={cn('ff-input pr-10', errors.password && 'ff-input-error')}
          />
          <button
            type="button"
            onClick={() => setShowNew((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {errors.password && <p className="ff-error">{errors.password.message}</p>}
      </div>

      <div>
        <label className="ff-label">Confirm New Password</label>
        <div className="relative">
          <input
            {...register('confirmPassword')}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your new password"
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

      <button type="submit" disabled={loading} className="btn-primary w-full h-10">
        {loading ? <><Loader2 className="animate-spin" size={15} /> Updating...</> : 'Update Password'}
      </button>
    </form>
  );
}
