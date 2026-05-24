import Link from 'next/link';
import { Truck, Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
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
        <p className="text-7xl font-black text-[#1E3A8A] mb-3 leading-none">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/shipper"
            className="inline-flex items-center justify-center gap-2 bg-[#1E3A8A] text-white font-semibold rounded-lg px-5 h-10 text-sm hover:bg-[#1e40af] transition-colors"
          >
            <LayoutDashboard size={15} /> Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium rounded-lg px-5 h-10 text-sm hover:bg-gray-50 transition-colors"
          >
            <Home size={15} /> Go Home
          </Link>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        Need help?{' '}
        <a href="/contact" className="text-[#1E3A8A] hover:underline">Contact support</a>
      </p>
    </main>
  );
}
