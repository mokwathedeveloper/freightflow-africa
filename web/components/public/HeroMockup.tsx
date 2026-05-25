'use client';

import { Truck, CheckCircle } from 'lucide-react';

export default function HeroMockup() {
  return (
    <div className="relative hidden lg:block">
      {/* Main dashboard card */}
      <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-2xl">
        {/* Titlebar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
              <Truck size={11} className="text-white" />
            </div>
            <span className="text-white/80 text-xs font-semibold">FreightFlow Dashboard</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400/60" />
            <div className="w-2 h-2 rounded-full bg-amber-400/60" />
            <div className="w-2 h-2 rounded-full bg-green-400/60" />
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Active Loads', value: '24' },
            { label: 'In Transit',   value: '8'  },
            { label: 'Delivered',    value: '186' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 rounded-xl p-2.5 text-center">
              <p className="text-white font-bold text-base">{value}</p>
              <p className="text-white/55 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Load rows */}
        <div className="space-y-2 mb-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white text-xs font-semibold">FF-2026-0847</span>
              <span className="text-xs bg-blue-400/25 text-blue-200 px-2 py-0.5 rounded-full font-medium">In Transit</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Nairobi</span>
              <div className="flex-1 border-t border-dashed border-white/25" />
              <span>Mombasa</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white text-xs font-semibold">FF-2026-0846</span>
              <span className="text-xs bg-green-400/25 text-green-200 px-2 py-0.5 rounded-full font-medium">Delivered</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Kisumu</span>
              <div className="flex-1 border-t border-dashed border-white/25" />
              <span>Nakuru</span>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white text-xs font-semibold">FF-2026-0845</span>
              <span className="text-xs bg-amber-400/25 text-amber-200 px-2 py-0.5 rounded-full font-medium">Posted</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Eldoret</span>
              <div className="flex-1 border-t border-dashed border-white/25" />
              <span>Garissa</span>
            </div>
          </div>
        </div>

        {/* SMS notification */}
        <div className="bg-[#16A34A]/30 border border-green-400/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
          <span className="text-xs text-green-200">SMS sent: Load accepted by Peter K. ✓</span>
        </div>
      </div>

      {/* Floating USSD badge */}
      <div className="absolute -bottom-4 -right-6 bg-white rounded-xl shadow-2xl px-4 py-3 border border-gray-100">
        <p className="text-xs font-bold text-[#1E3A8A]">Dial *384*7447#</p>
        <p className="text-xs text-gray-400">Works on any phone</p>
      </div>

      {/* Floating SMS badge */}
      <div className="absolute -top-4 -left-6 bg-white rounded-xl shadow-2xl px-4 py-3 border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={12} className="text-[#16A34A]" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">Delivery confirmed</p>
            <p className="text-xs text-gray-400">+KES 20 airtime reward</p>
          </div>
        </div>
      </div>
    </div>
  );
}
