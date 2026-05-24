import { Target, Eye, Users, Award, Truck, Package, Globe, Star, Newspaper } from 'lucide-react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

const TEAM = [
  {
    name: 'David Njoroge',
    role: 'Chief Executive Officer',
    bio: 'Former logistics director at Kenya Airways Cargo. 15 years transforming freight operations across East Africa.',
    initials: 'DN',
    bg: 'bg-blue-100 text-[#1E3A8A]',
  },
  {
    name: 'Grace Wanjiku',
    role: 'Chief Technology Officer',
    bio: 'Ex-Safaricom engineer. Built payment rails for M-PESA Fuliza. Obsessed with offline-first infrastructure.',
    initials: 'GW',
    bg: 'bg-green-100 text-[#16A34A]',
  },
  {
    name: 'Samuel Ochieng',
    role: 'Chief Operations Officer',
    bio: '10-year veteran of cross-border trucking between Mombasa and Kampala. Knows every route, every pain point.',
    initials: 'SO',
    bg: 'bg-purple-100 text-purple-600',
  },
  {
    name: 'Fatuma Abdullahi',
    role: 'Head of Logistics',
    bio: 'Certified supply chain specialist. Pioneered corridor freight digitization for the Northern Corridor.',
    initials: 'FA',
    bg: 'bg-amber-100 text-amber-600',
  },
];

const TIMELINE = [
  {
    year: '2023',
    event: 'Problem Discovery',
    desc: 'Our founders witnessed first-hand how truck drivers lost income to empty return trips and how shippers struggled to find reliable transporters.',
  },
  {
    year: '2024',
    event: 'MVP Built',
    desc: 'First version launched with 12 shippers and 30 transporters along the Nairobi–Mombasa corridor. 90% on-time delivery rate from day one.',
  },
  {
    year: '2025',
    event: 'USSD Integration',
    desc: "Partnered with Africa's Talking to bring USSD access. Drivers on basic phones can now update delivery status without internet.",
  },
  {
    year: '2026',
    event: 'Hackathon & Scale',
    desc: "Selected for Africa's Talking Hackathon. Expanding to Uganda, Tanzania. 2,400+ active loads. 850+ verified transporters.",
  },
];

const VALUES = [
  { icon: Users,  title: 'Inclusive',   desc: 'Built for every phone, every driver, every corner of East Africa.' },
  { icon: Award,  title: 'Trustworthy', desc: 'Verified transporters, transparent pricing, dispute resolution built in.' },
  { icon: Globe,  title: 'Pan-African', desc: 'Designed from day one for cross-border trade across the continent.' },
];

const PRESS = [
  { outlet: "Africa's Talking",  quote: 'Selected for the 2026 AT Hackathon — top logistics innovation.',   icon: Star },
  { outlet: 'TechCabal',         quote: 'One of the most promising freight-tech startups in East Africa.',    icon: Newspaper },
  { outlet: 'Business Daily',    quote: 'FreightFlow is tackling the $2.3B empty-truck problem head-on.',    icon: Newspaper },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-[#1E3A8A] text-white py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">About FreightFlow</h1>
          <p className="text-white/80 text-base max-w-2xl mx-auto leading-relaxed">
            We are on a mission to digitise East Africa&apos;s freight industry — making cargo movement
            faster, cheaper, and accessible to every shipper and every driver, regardless of the
            phone they carry.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <div className="w-12 h-12 bg-[#1E3A8A] rounded-xl flex items-center justify-center mb-5">
              <Target size={22} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              To connect every shipper in East Africa with a reliable transporter — eliminating
              empty trucks, reducing costs, and creating economic opportunity through technology
              that works on any phone, anywhere.
            </p>
          </div>
          <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
            <div className="w-12 h-12 bg-[#16A34A] rounded-xl flex items-center justify-center mb-5">
              <Eye size={22} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              A pan-African freight marketplace where cargo moves seamlessly across borders,
              every truck is fully utilised, and every transporter earns a fair, predictable
              income — powered by inclusive, offline-first technology.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <Icon size={18} className="text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 px-5 bg-gray-50 border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">People</p>
            <h2 className="text-2xl font-bold text-gray-900">Our Leadership Team</h2>
            <p className="text-sm text-gray-500 mt-2">
              Built by operators and engineers who have lived the freight problem first-hand.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map(({ name, role, bio, initials, bg }) => (
              <div key={name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold ${bg}`}>
                  {initials}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
                <p className="text-xs text-[#1E3A8A] font-medium mt-0.5 mb-3">{role}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Journey</p>
            <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
            <div className="space-y-8">
              {TIMELINE.map(({ year, event, desc }) => (
                <div key={year} className="relative pl-16">
                  <div className="absolute left-0 w-12 h-12 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {year.slice(2)}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded-full">{year}</span>
                      <h3 className="font-semibold text-gray-900 text-sm">{event}</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press & Awards */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recognition</p>
            <h2 className="text-2xl font-bold text-gray-900">Press &amp; Awards</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {PRESS.map(({ outlet, quote, icon: Icon }) => (
              <div key={outlet} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={16} className="text-amber-500" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">&ldquo;{quote}&rdquo;</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{outlet}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-5 bg-[#1E3A8A]">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="flex justify-center gap-3">
            <Truck size={22} className="text-white/60" />
            <Package size={22} className="text-white/60" />
          </div>
          <h2 className="text-2xl font-bold text-white">Join the movement</h2>
          <p className="text-sm text-white/70">
            Be part of Africa&apos;s freight revolution. Free to join for shippers and transporters.
          </p>
          <a
            href="/auth/role"
            className="inline-flex items-center gap-2 bg-white text-[#1E3A8A] font-semibold rounded-lg px-8 h-11 text-sm hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </a>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
