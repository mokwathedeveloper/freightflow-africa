'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, CheckCircle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';
import PasswordStrengthMeter from './PasswordStrengthMeter';

type Step = 'form' | 'otp' | 'done';

export function SecurityTab() {
  const addToast = useToastStore((s) => s.addToast);
  const [step,        setStep]        = useState<Step>('form');
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [otp,         setOtp]         = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  const requestMut = useMutation({
    mutationFn: () => api.post('/auth/change-password/request'),
    onSuccess: () => setStep('otp'),
    onError:   () => addToast('error', 'Failed to send OTP. Try again.'),
  });

  const confirmMut = useMutation({
    mutationFn: () => api.post('/auth/change-password/confirm', {
      currentPassword: currentPw,
      newPassword:     newPw,
      otp:             otp.join(''),
    }),
    onSuccess: () => { setStep('done'); addToast('success', 'Password changed successfully'); },
    onError:   () => addToast('error', 'Invalid OTP or current password.'),
  });

  function handleOtpChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[i] = digit; setOtp(next);
    if (digit && i < 5) otpInputRefs.current[i + 1]?.focus();
  }

  function handleOtpKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpInputRefs.current[i - 1]?.focus();
  }

  function handleOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...otp]; digits.forEach((d, idx) => { next[idx] = d; }); setOtp(next);
    otpInputRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  function handleSubmit() {
    if (!currentPw || !newPw) { addToast('error', 'All fields are required'); return; }
    if (newPw !== confirmPw)  { addToast('error', 'Passwords do not match'); return; }
    if (newPw.length < 8)     { addToast('error', 'Password must be at least 8 characters'); return; }
    requestMut.mutate();
  }

  function reset() {
    setStep('form'); setCurrentPw(''); setNewPw(''); setConfirmPw(''); setOtp(['', '', '', '', '', '']);
  }

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={28} className="text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Password Changed</h3>
        <p className="text-sm text-gray-500 mt-1">Your password has been updated successfully.</p>
        <button onClick={reset} className="mt-5 text-sm text-[#1E3A8A] hover:underline">Change again</button>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="max-w-sm space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-[#1E3A8A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Enter verification code</p>
            <p className="text-xs text-gray-500">A 6-digit code was sent to your phone via SMS</p>
          </div>
        </div>
        <div className="flex gap-2">
          {otp.map((digit, i) => (
            <input key={i} ref={(el) => { otpInputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKey(i, e)}
              onPaste={i === 0 ? handleOtpPaste : undefined}
              className={cn(
                'w-10 h-12 text-center text-lg font-semibold rounded-lg border-2 outline-none transition-colors',
                digit ? 'border-[#1E3A8A] bg-[#1E3A8A]/5' : 'border-gray-200'
              )}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep('form')} className="btn-secondary h-10 px-5">Back</button>
          <button
            onClick={() => confirmMut.mutate()}
            disabled={otp.join('').length < 6 || confirmMut.isPending}
            className="btn-primary h-10 flex-1 flex items-center justify-center gap-2"
          >
            {confirmMut.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Confirm Change'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm space-y-4">
      <div>
        <label className="ff-label">Current Password</label>
        <div className="relative">
          <input type={showCurrent ? 'text' : 'password'} value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)} placeholder="Enter current password" className="ff-input pr-10" />
          <button type="button" onClick={() => setShowCurrent((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <div>
        <label className="ff-label">New Password</label>
        <div className="relative">
          <input type={showNew ? 'text' : 'password'} value={newPw}
            onChange={(e) => setNewPw(e.target.value)} placeholder="At least 8 characters" className="ff-input pr-10" />
          <button type="button" onClick={() => setShowNew((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <PasswordStrengthMeter password={newPw} />
      </div>
      <div>
        <label className="ff-label">Confirm New Password</label>
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="Repeat new password"
          className={cn('ff-input', confirmPw && confirmPw !== newPw && 'ff-input-error')} />
        {confirmPw && confirmPw !== newPw && <p className="ff-error">Passwords do not match</p>}
      </div>
      <div className="pt-1">
        <button onClick={handleSubmit} disabled={requestMut.isPending}
          className="btn-primary h-10 px-6 flex items-center gap-2">
          {requestMut.isPending ? <Loader2 size={15} className="animate-spin" /> : 'Change Password'}
        </button>
      </div>
    </div>
  );
}
