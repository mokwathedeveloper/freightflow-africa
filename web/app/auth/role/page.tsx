'use client';

import { useRouter } from 'next/navigation';
import { Truck, Package } from 'lucide-react';
import Link from 'next/link';

export default function RolePage() {
  const router = useRouter();

  function selectRole(role: 'SHIPPER' | 'TRANSPORTER') {
    sessionStorage.setItem('selectedRole', role);
    router.push('/auth/register');
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1E3A8A] rounded-xl mb-4 shadow-md">
            <Truck className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FreightFlow</h1>
          <p className="text-sm text-gray-500 mt-1">Move cargo. Track everything.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 text-center mb-1">Select your role</h2>
          <p className="text-sm text-gray-500 text-center mb-5">How will you use FreightFlow?</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => selectRole('SHIPPER')}
              className="group flex flex-col items-center gap-3 p-5 rounded-lg border-2 border-gray-200
                         hover:border-[#1E3A8A] hover:bg-blue-50 transition-all duration-150 cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center
                              group-hover:bg-blue-200 transition-colors">
                <Package className="text-[#1E3A8A]" size={24} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm leading-tight">I&apos;m a</p>
                <p className="font-semibold text-gray-900 text-sm leading-tight">Shipper</p>
                <p className="text-xs text-gray-500 mt-1">Post loads &amp; track cargo</p>
              </div>
            </button>

            <button
              onClick={() => selectRole('TRANSPORTER')}
              className="group flex flex-col items-center gap-3 p-5 rounded-lg border-2 border-gray-200
                         hover:border-[#1E3A8A] hover:bg-blue-50 transition-all duration-150 cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center
                              group-hover:bg-orange-200 transition-colors">
                <Truck className="text-orange-600" size={24} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 text-sm leading-tight">I&apos;m a</p>
                <p className="font-semibold text-gray-900 text-sm leading-tight">Transporter</p>
                <p className="text-xs text-gray-500 mt-1">Find loads &amp; earn</p>
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#1E3A8A] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
