'use client';

import { useRouter } from 'next/navigation';
import { Truck, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RolePage() {
  const router = useRouter();

  function selectRole(role: 'SHIPPER' | 'TRANSPORTER') {
    sessionStorage.setItem('selectedRole', role);
    router.push('/auth/register');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
            <Truck className="text-primary-foreground" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">FreightFlow</h1>
          <p className="text-muted-foreground mt-1">Digital freight marketplace for Africa</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground text-center mb-2">I am a...</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Choose your role to get started
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => selectRole('SHIPPER')}
              className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-150 text-left cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Shipper</p>
                <p className="text-xs text-muted-foreground mt-0.5">Post loads &amp; track cargo</p>
              </div>
            </button>

            <button
              onClick={() => selectRole('TRANSPORTER')}
              className="group flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-150 text-left cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Truck className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Transporter</p>
                <p className="text-xs text-muted-foreground mt-0.5">Find loads &amp; earn money</p>
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <a href="/auth/login" className="text-primary font-medium hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
