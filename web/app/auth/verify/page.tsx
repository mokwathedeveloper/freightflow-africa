'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToastStore } from '@/store/toast.store';
import type { User } from '@/types';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  const prefix = phone.slice(0, 4); // +254
  const suffix = phone.slice(-3);
  return `${prefix} *** *** ${suffix}`;
}

export default function VerifyPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const addToast = useToastStore((s) => s.addToast);

  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('verifyPhone');
    if (!stored) {
      router.replace('/auth/register');
    } else {
      setPhone(stored);
      // Auto-focus first box
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
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

  async function handleVerify() {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      addToast('error', 'Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp });
      const { user, accessToken, refreshToken } = data.data as {
        user: User;
        accessToken: string;
        refreshToken: string;
      };
      setAuth(user, accessToken, refreshToken);
      sessionStorage.removeItem('verifyPhone');
      sessionStorage.removeItem('selectedRole');
      addToast('success', 'Phone verified! Welcome to FreightFlow.');
      router.replace(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'That code doesn\'t match. Please try again.';
      addToast('error', msg);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await api.post('/auth/send-otp', { phone });
      setCountdown(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      addToast('info', 'New code sent to ' + phone);
    } catch {
      addToast('error', 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  const otpComplete = digits.join('').length === OTP_LENGTH;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Icon + heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-2xl mb-4">
            <ShieldCheck className="text-[#1E3A8A]" size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verify your number</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit code sent to{' '}
            <span className="font-semibold text-gray-700">{maskPhone(phone)}</span>
          </p>
        </div>

        {/* OTP Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* 6 digit boxes */}
          <div
            className="flex items-center justify-center gap-2 mb-6"
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

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={loading || !otpComplete}
            className="btn-primary w-full h-10"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={15} /> Verifying...</>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend */}
          <div className="text-center mt-4">
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

        <p className="text-center text-sm text-gray-500 mt-4">
          Wrong number?{' '}
          <a href="/auth/register" className="text-[#1E3A8A] font-medium hover:underline">
            Go back
          </a>
        </p>
      </div>
    </main>
  );
}
