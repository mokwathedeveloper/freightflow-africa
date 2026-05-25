import { Truck, Package, CheckCircle, BarChart2, TrendingUp, Phone, X } from 'lucide-react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import HeroSection from '@/components/public/HeroSection';
import StatsBar from '@/components/public/StatsBar';
import FeatureCard from '@/components/public/FeatureCard';
import TrustedBrands from '@/components/public/TrustedBrands';
import ATAPIsSection from '@/components/public/ATAPIsSection';
import HowItWorks from '@/components/public/HowItWorks';
import USSDHighlight from '@/components/public/USSDHighlight';
import CompetitiveMatrix from '@/components/public/CompetitiveMatrix';
import TestimonialCarousel from '@/components/public/TestimonialCarousel';
import CTASection from '@/components/public/CTASection';
import { PLATFORM_FEATURES } from '@/data/features';
import { TESTIMONIALS } from '@/data/testimonials';

const TRUST_STATS = [
  { value: '2,400+', label: 'Active Loads' },
  { value: '850+',   label: 'Transporters' },
  { value: '98%',    label: 'On-time Rate' },
  { value: '12',     label: 'Counties Covered' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: Package,     title: 'Shipper Posts a Load',  desc: 'Enter origin, destination, cargo type, and weight. Transporters are instantly notified via SMS.' },
  { step: '02', icon: Truck,       title: 'Transporter Accepts',   desc: 'Browse loads on the dashboard or respond to an SMS. One-click accept — shipper is notified.' },
  { step: '03', icon: CheckCircle, title: 'Track & Confirm',       desc: 'Status updates via web or USSD. Shipper confirms delivery and rates the transporter.' },
];

const MARKET_STATS = [
  { value: '$184M', label: 'African Freight Market 2026', icon: BarChart2,    color: 'text-[#1E3A8A]' },
  { value: '$303M', label: 'Projected by 2034',           icon: TrendingUp,   color: 'text-[#16A34A]' },
  { value: '70%',   label: 'Drivers on basic phones',     icon: Phone,        color: 'text-amber-600'  },
  { value: '0',     label: 'Competitors with USSD',       icon: X,            color: 'text-red-500'    },
];

const FEATURE_MATRIX = [
  { feature: 'USSD status updates (no internet)',   freightflow: true,  others: false, note: 'Only Sendy had this — now closed' },
  { feature: 'Airtime rewards for drivers',          freightflow: true,  others: false, note: 'Zero competitors implement this' },
  { feature: "SMS alerts via Africa's Talking",      freightflow: true,  others: false, note: 'AT-native vs custom SMS providers' },
  { feature: 'SME / small load marketplace',         freightflow: true,  others: false, note: '80% of African logistics is informal' },
  { feature: 'Voice call alerts (critical events)',  freightflow: true,  others: false, note: 'Automated IVR for delays & disputes' },
  { feature: 'Real-time GPS cargo tracking',         freightflow: true,  others: true  },
  { feature: 'Dispute resolution with escrow',       freightflow: true,  others: true  },
  { feature: 'Driver vetting & rating system',       freightflow: true,  others: true  },
  { feature: 'Cross-border (AfCFTA) support',        freightflow: true,  others: false, note: 'Kobo360 developing; others: none' },
];

const COMPETITORS = ['Kobo360', 'Lori Systems', 'Trella', 'Amitruck'];

const TRUSTED_BRANDS = [
  'Kenya Airways Cargo', 'TotalEnergies EA', 'Bidco Africa',
  'Chandaria Industries', 'East Africa Breweries', 'Unilever Kenya',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />

      <HeroSection
        badge="Africa's Talking Hackathon 2026 · Nairobi"
        headline="Move Cargo."
        greenSpan="Track Everything."
        subheadline="Connect shippers with transporters across Kenya. Post loads, track cargo in real time, and update delivery status from any phone — even without internet via USSD."
      />

      <StatsBar stats={TRUST_STATS} />

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

      <TrustedBrands brands={TRUSTED_BRANDS} />
      <ATAPIsSection />
      <HowItWorks steps={HOW_IT_WORKS} />
      <USSDHighlight ussdCode="*384*7447#" />
      <CompetitiveMatrix marketStats={MARKET_STATS} competitors={COMPETITORS} featureMatrix={FEATURE_MATRIX} />
      <TestimonialCarousel testimonials={TESTIMONIALS} />

      <CTASection
        headline="Ready to move freight smarter?"
        subtext="Join FreightFlow — free for shippers and transporters. No app download needed."
        primaryHref="/auth/role"
        primaryLabel="Create Free Account"
        secondaryHref="/contact"
        secondaryLabel="Talk to Sales"
      />

      <PublicFooter />
    </div>
  );
}
