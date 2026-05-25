'use client';

import { cn } from '@/lib/utils';

interface Props {
  password: string;
}

function score(pw: string): number {
  let s = 0;
  if (pw.length >= 8)                          s++;
  if (pw.length >= 12)                         s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))  s++;
  if (/[0-9]/.test(pw))                        s++;
  if (/[^A-Za-z0-9]/.test(pw))               s++;
  return Math.min(s, 4);
}

const LEVELS = [
  { label: 'Weak',       bar: 'bg-red-500',    text: 'text-red-600' },
  { label: 'Fair',       bar: 'bg-amber-500',  text: 'text-amber-600' },
  { label: 'Good',       bar: 'bg-blue-500',   text: 'text-blue-600' },
  { label: 'Strong',     bar: 'bg-green-500',  text: 'text-green-600' },
  { label: 'Very Strong', bar: 'bg-green-600', text: 'text-green-700' },
] as const;

export default function PasswordStrengthMeter({ password }: Props) {
  if (!password) return null;

  const s = score(password);
  const { label, bar, text } = LEVELS[s];

  return (
    <div className="mt-2 space-y-1" aria-label={`Password strength: ${label}`}>
      <div className="flex gap-1" role="presentation">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= s ? bar : 'bg-gray-200')}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', text)}>{label}</p>
    </div>
  );
}
