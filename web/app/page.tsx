import {
  Truck, Package,
  Zap, Phone,
  CheckCircle, Clock,
  X, BarChart2, TrendingUp as TrendingUpIcon,
} from 'lucide-react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import FeatureCard from '@/components/public/FeatureCard';
import TestimonialCard from '@/components/public/TestimonialCard';
import CTAButton from '@/components/public/CTAButton';
import { PLATFORM_FEATURES, AT_API_FEATURES } from '@/data/features';
import { TESTIMONIALS } from '@/data/testimonials';

// ─── Static page data ──────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Package,
    title: 'Shipper Posts a Load',
    desc: 'Enter origin, destination, cargo type, and weight. Transporters are instantly notified via SMS.',
  },
  {
    step: '02',
    icon: Truck,
    title: 'Transporter Accepts',
    desc: 'Browse loads on the dashboard or respond to an SMS. One-click accept — shipper is notified.',
  },
  {
    step: '03',
    icon: CheckCircle,
    title: 'Track & Confirm',
    desc: 'Status updates via web or USSD. Shipper confirms delivery and rates the transporter.',
  },
];

const TRUST_STATS = [
  { value: '2,400+', label: 'Active Loads' },
  { value: '850+',   label: 'Transporters' },
  { value: '98%',    label: 'On-time Rate' },
  { value: '12',     label: 'Counties Covered' },
];

const MARKET_STATS = [
  { value: '$184M',   label: 'African Freight Market 2026', icon: BarChart2, color: 'text-[#1E3A8A]' },
  { value: '$303M',   label: 'Projected by 2034',           icon: TrendingUpIcon, color: 'text-[#16A34A]' },
  { value: '70%',     label: 'Drivers on basic phones',     icon: Phone, color: 'text-amber-600' },
  { value: '0',       label: 'Competitors with USSD',       icon: X, color: 'text-red-500' },
];

const COMPETITORS = ['Kobo360', 'Lori Systems', 'Trella', 'Amitruck'];
type FeatureRow = { feature: string; freightflow: boolean; others: boolean; note?: string };
const FEATURE_MATRIX: FeatureRow[] = [
  { feature: 'USSD status updates (no internet)',   freightflow: true,  others: false, note: 'Only Sendy had this — now closed' },
  { feature: 'Airtime rewards for drivers',          freightflow: true,  others: false, note: 'Zero competitors implement this' },
  { feature: 'SMS alerts via Africa\'s Talking',     freightflow: true,  others: false, note: 'AT-native vs custom SMS providers' },
  { feature: 'SME / small load marketplace',         freightflow: true,  others: false, note: '80% of African logistics is informal' },
  { feature: 'Voice call alerts (critical events)',  freightflow: true,  others: false, note: 'Automated IVR for delays & disputes' },
  { feature: 'Real-time GPS cargo tracking',         freightflow: true,  others: true  },
  { feature: 'Dispute resolution with escrow',       freightflow: true,  others: true  },
  { feature: 'Driver vetting & rating system',       freightflow: true,  others: true  },
  { feature: 'Cross-border (AfCFTA) support',        freightflow: true,  others: false, note: 'Kobo360 developing; others: none' },
];

const TRUSTED_BRANDS = [
  'Kenya Airways Cargo',
  'TotalEnergies EA',
  'Bidco Africa',
  'Chandaria Industries',
  'East Africa Breweries',
  'Unilever Kenya',
];

// ─── Hero app mockup ───────────────────────────────────────────────────────────
function HeroMockup() {
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#1E3A8A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="relative max-w-6xl mx-auto px-5 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap size={12} aria-hidden="true" /> Africa&apos;s Talking Hackathon 2026 · Nairobi
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
              Move Cargo.<br />
              <span style={{ color: '#86efac' }}>Track Everything.</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">
              Connect shippers with transporters across Kenya. Post loads, track cargo in
              real time, and update delivery status from any phone — even without internet via USSD.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <CTAButton href="/auth/role" variant="primary" size="md" showArrow>
                Sign Up Free
              </CTAButton>
              <CTAButton href="#features" variant="outline-white" size="md">
                Learn More
              </CTAButton>
              <CTAButton href="/contact" variant="ghost" size="md" showArrow>
                Request Demo
              </CTAButton>
            </div>
          </div>

          {/* App mockup */}
          <HeroMockup />
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-b border-gray-200 py-6 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {TRUST_STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-black text-[#1E3A8A]">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Platform</p>
            <h2 className="text-2xl font-bold text-gray-900">What we offer</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Everything you need to move cargo efficiently across East Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PLATFORM_FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted by ────────────────────────────────────────────── */}
      <section className="py-12 px-5 border-y border-gray-100 bg-gray-50/60">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
            Trusted by logistics companies across Africa
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {TRUSTED_BRANDS.map((brand) => (
              <div
                key={brand}
                className="px-5 py-2.5 bg-white rounded-lg border border-gray-200 shadow-sm text-sm font-semibold text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors whitespace-nowrap"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Africa's Talking APIs ─────────────────────────────────── */}
      <section id="apis" className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Powered by</p>
            <h2 className="text-2xl font-bold text-gray-900">Africa&apos;s Talking APIs</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Every notification, OTP, status update, and reward runs through Africa&apos;s Talking infrastructure.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AT_API_FEATURES.map((f) => (
              <FeatureCard key={f.label} title={f.label} desc={f.desc} icon={f.icon} iconBg={f.iconBg} iconColor={f.iconColor} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 px-5 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Process</p>
            <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
            <p className="text-sm text-gray-500 mt-2">Three steps from load to delivered</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(100%-0px)] w-8 border-t-2 border-dashed border-gray-300 z-10" />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-black text-gray-100">{step}</span>
                  <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white" aria-hidden="true" />
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
      <section id="ussd" className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#1E3A8A] rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="flex-1 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <Clock size={11} aria-hidden="true" /> Inclusive Design
              </div>
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

      {/* ── Market Size & Competitive Moat ───────────────────────── */}
      <section className="py-16 px-5 bg-white border-t border-gray-100" id="why-us">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Market Position</p>
            <h2 className="text-2xl font-bold text-gray-900">Why FreightFlow wins</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Africa&apos;s freight market is $184M today, growing to $303M by 2034. None of our
              competitors serve feature-phone drivers or small shippers.
            </p>
          </div>

          {/* Market stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {MARKET_STATS.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <Icon size={18} className={`${color} mx-auto mb-2`} aria-hidden="true" />
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-3 text-xs font-bold text-gray-600 uppercase tracking-wider">
              <div className="px-5 py-3">Feature</div>
              <div className="px-4 py-3 text-center border-l border-gray-200">
                <span className="text-[#1E3A8A]">FreightFlow</span>
              </div>
              <div className="px-4 py-3 text-center border-l border-gray-200 text-gray-400">
                {COMPETITORS.slice(0, 3).join(' / ')}
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {FEATURE_MATRIX.map(({ feature, freightflow, others, note }) => (
                <div key={feature} className="grid grid-cols-3 items-start hover:bg-gray-50/60 transition-colors">
                  <div className="px-5 py-3">
                    <p className="text-sm text-gray-800">{feature}</p>
                    {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
                  </div>
                  <div className="px-4 py-3 flex justify-center border-l border-gray-100">
                    {freightflow
                      ? <CheckCircle size={18} className="text-[#16A34A]" aria-label="Yes" />
                      : <X size={16} className="text-gray-300" aria-label="No" />}
                  </div>
                  <div className="px-4 py-3 flex justify-center border-l border-gray-100">
                    {others
                      ? <CheckCircle size={18} className="text-gray-400" aria-label="Yes" />
                      : <X size={16} className="text-red-400" aria-label="No" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#1E3A8A]/5 border-t border-gray-200 px-5 py-3">
              <p className="text-xs text-gray-500">
                * Sendy (Kenya) was the only platform with USSD — they shut down in 2024. FreightFlow fills this gap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-16 px-5 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-2xl font-bold text-gray-900">Trusted by logistics professionals</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 px-5 bg-[#1E3A8A]">
        <div className="max-w-xl mx-auto text-center space-y-5">
          <h2 className="text-2xl font-bold text-white">Ready to move freight smarter?</h2>
          <p className="text-sm text-white/70 leading-relaxed">
            Join FreightFlow — free for shippers and transporters. No app download needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CTAButton href="/auth/role" variant="primary" size="md" showArrow>
              Create Free Account
            </CTAButton>
            <CTAButton href="/contact" variant="outline-white" size="md">
              Talk to Sales
            </CTAButton>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
