'use client';

import { useEffect } from 'react';
import { Truck, RefreshCw, MessageCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 bg-[#1E3A8A] rounded-xl flex items-center justify-center shadow-sm">
          <Truck size={18} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg">FreightFlow</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-sm w-full">
        <p className="text-7xl font-black text-gray-200 mb-3 leading-none">500</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          An unexpected error occurred. Please try again in a moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white font-semibold rounded-lg px-5 h-10 text-sm hover:bg-[#1e40af] transition-colors"
          >
            <RefreshCw size={15} /> Try Again
          </button>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium rounded-lg px-5 h-10 text-sm hover:bg-gray-50 transition-colors"
          >
            <MessageCircle size={15} /> Contact Support
          </a>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Error reference: <span className="font-mono">{error.digest ?? 'unknown'}</span>
      </p>
    </main>
  );
}
