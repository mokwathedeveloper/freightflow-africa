import Link from 'next/link';
import {
  Truck, Package, MessageSquare, Radio,
  Zap, Shield, ChevronRight, Star, MapPin, Phone,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center shadow-sm">
              <Truck size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">FreightFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</a>
            <a href="#apis" className="hover:text-gray-900 transition-colors">APIs</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Sign In
            </Link>
            <Link href="/auth/role" className={cn(buttonVariants({ size: 'sm' }))}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#1E3A8A] text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative max-w-6xl mx-auto px-5 py-20 sm:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap size={12} /> Africa&apos;s Talking Hackathon 2026 · Nairobi
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
              Digital Freight Marketplace<br />
              <span style={{ color: '#86efac' }}>for Africa</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Connect shippers with transporters across Kenya. Post loads, track cargo in
              real time, and update delivery status from any phone — even without internet
              via USSD.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/auth/role"
                className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] font-semibold rounded-lg px-6 h-11 text-sm hover:bg-gray-100 transition-colors shadow-sm"
              >
                <Package size={15} /> I&apos;m a Shipper
              </Link>
              <Link
                href="/auth/role"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold rounded-lg px-6 h-11 text-sm hover:bg-white/20 transition-colors border border-white/20"
              >
                <Truck size={15} /> I&apos;m a Transporter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-b border-gray-200 py-5 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-gray-600">
          {[
            ['100%', 'Free to join'],
            ['SMS', 'Real-time alerts'],
            ['USSD', 'No internet needed'],
            ['Multi-tenant', 'For any fleet size'],
          ].map(([val, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-bold text-[#1E3A8A]">{val}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Africa's Talking APIs ─────────────────────────────────── */}
      <section id="apis" className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Powered by
            </p>
            <h2 className="text-2xl font-bold text-gray-900">Africa&apos;s Talking APIs</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Every notification, status update, and reward runs through Africa&apos;s Talking infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: MessageSquare,
                label: 'SMS API',
                desc: 'Instant load alerts, OTP authentication, delivery confirmations sent to shipper & transporter.',
                color: 'bg-blue-50 text-[#1E3A8A]',
              },
              {
                icon: Radio,
                label: 'USSD API',
                desc: 'Dial *384*7447# on any basic phone. Drivers update cargo status without an internet connection.',
                color: 'bg-green-50 text-[#16A34A]',
              },
              {
                icon: Phone,
                label: 'Voice API',
                desc: 'Automated call alerts for critical events — delays, disputes, and high-value delivery confirmations.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                icon: Star,
                label: 'Airtime API',
                desc: 'KES 20 airtime reward disbursed automatically to transporters who complete on-time deliveries.',
                color: 'bg-amber-50 text-amber-600',
              },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 px-5 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
            <p className="text-sm text-gray-500 mt-2">Three steps from load to delivered</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                step: '01',
                title: 'Shipper Posts a Load',
                desc: 'Enter origin, destination, cargo type, and weight. Transporters are instantly notified via SMS.',
              },
              {
                icon: Truck,
                step: '02',
                title: 'Transporter Accepts',
                desc: 'Browse loads on the dashboard or respond to an SMS. One-click accept — shipper is notified immediately.',
              },
              {
                icon: MapPin,
                step: '03',
                title: 'Track & Confirm',
                desc: 'Status updates via web app or *384*7447# USSD. Shipper confirms delivery and rates the transporter.',
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-gray-100">{step}</span>
                  <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USSD Highlight ────────────────────────────────────────── */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#1E3A8A] rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex-1 text-white">
              <p className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-2">Inclusive Design</p>
              <h2 className="text-2xl font-bold mb-3">No smartphone? No problem.</h2>
              <p className="text-white/80 text-sm leading-relaxed max-w-md">
                Over 70% of Kenyan truck drivers use basic feature phones. FreightFlow&apos;s USSD
                integration means every driver can update cargo status, check job details, and
                receive notifications — all without internet.
              </p>
            </div>
            <div className="shrink-0 text-center">
              <div className="bg-white/10 border border-white/20 rounded-xl px-8 py-6">
                <p className="text-white/60 text-xs font-medium mb-2">Dial from any phone</p>
                <p className="text-white text-3xl font-mono font-black tracking-wider">*384*7447#</p>
                <p className="text-white/60 text-xs mt-2">Update status · Check jobs · View payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 px-5 bg-gray-50 border-t border-gray-200">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <Shield size={28} className="mx-auto text-[#1E3A8A]" />
          <h2 className="text-2xl font-bold text-gray-900">Ready to move freight smarter?</h2>
          <p className="text-sm text-gray-500">
            Join FreightFlow — free for shippers and transporters. No app download needed.
          </p>
          <Link
            href="/auth/role"
            className={cn(buttonVariants(), 'h-11 px-8 inline-flex items-center gap-2')}
          >
            Create Free Account <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#1E3A8A] rounded flex items-center justify-center">
              <Truck size={11} className="text-white" />
            </div>
            <span className="font-semibold text-gray-600">FreightFlow</span>
          </div>
          <p>© 2026 FreightFlow · Africa&apos;s Talking Transportation &amp; Logistics Hackathon</p>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-gray-600 transition-colors">Sign In</Link>
            <Link href="/auth/role" className="hover:text-gray-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
