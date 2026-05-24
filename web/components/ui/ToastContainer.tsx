'use client';

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToastStore } from '@/store/toast.store';
import { cn } from '@/lib/utils';

const icons = {
  success: <CheckCircle size={16} className="text-green-600 shrink-0" />,
  error: <AlertCircle size={16} className="text-red-600 shrink-0" />,
  info: <Info size={16} className="text-blue-600 shrink-0" />,
};

const styles = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border p-3 shadow-md animate-in slide-in-from-right-5',
            styles[t.type]
          )}
        >
          {icons[t.type]}
          <p className="text-sm text-foreground flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
