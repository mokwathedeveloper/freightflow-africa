'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useToastStore } from '@/store/toast.store';
import type { User } from '@/types';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

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
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (paste.length === OTP_LENGTH) {
      setDigits(paste.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  }

  async function handleVerify() {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      addToast('error', 'Please enter the full 6-digit OTP');
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
        'Invalid or expired OTP.';
      addToast('error', msg);
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
      addToast('info', 'New OTP sent to ' + phone);
    } catch {
      addToast('error', 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-xl mb-3">
            <Truck className="text-primary-foreground" size={20} />
          </div>
          <h1 className="text-xl font-bold text-foreground">Verify your phone</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the 6-digit code sent to{' '}
            <span className="font-medium text-foreground">{phone}</span>
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-center gap-2 mb-6" onPaste={handlePaste}>
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
                  'w-11 h-12 rounded-lg border text-center text-lg font-semibold text-foreground bg-background',
                  'outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20',
                  d ? 'border-primary' : 'border-border'
                )}
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            disabled={loading || digits.join('').length < OTP_LENGTH}
            className="w-full h-10"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify Phone'}
          </Button>

          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in{' '}
                <span className="font-medium text-foreground tabular-nums">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-primary hover:underline disabled:opacity-50 flex items-center gap-1 mx-auto"
              >
                {resending ? <Loader2 className="animate-spin" size={12} /> : null}
                Resend OTP
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Wrong number?{' '}
          <a href="/auth/register" className="text-primary hover:underline">
            Go back
          </a>
        </p>
      </div>
    </main>
  );
}
