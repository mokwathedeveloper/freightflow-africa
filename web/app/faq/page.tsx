'use client';

import { useState } from 'react';
import { ChevronDown, Search, MessageCircle, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'General', 'Getting Started', 'Loads & Shipments', 'Tracking', 'Payments', 'Account & Security'];

const FAQS: { category: string; q: string; a: string }[] = [
  // General
  {
    category: 'General',
    q: 'What is FreightFlow?',
    a: 'FreightFlow is a digital freight marketplace that connects shippers (who need cargo moved) with transporters (truck owners and drivers) across East Africa. We make it easy to post loads, accept jobs, track shipments, and get paid — all from a web browser or even a basic phone via USSD.',
  },
  {
    category: 'General',
    q: 'Is FreightFlow free to use?',
    a: 'Yes. Creating an account is completely free for both shippers and transporters. FreightFlow earns a small platform fee on completed deliveries, which is already factored into the quoted price.',
  },
  {
    category: 'General',
    q: 'Which countries does FreightFlow operate in?',
    a: 'We currently operate in Kenya, with active loads on the Nairobi–Mombasa and Nairobi–Kisumu corridors. We are expanding to Uganda and Tanzania in 2026.',
  },
  // Getting Started
  {
    category: 'Getting Started',
    q: 'How do I create an account?',
    a: 'Click "Get Started" on the homepage, choose your role (Shipper or Transporter), fill in your details, and verify your phone number with a 6-digit SMS code sent via Africa\'s Talking. The whole process takes under two minutes.',
  },
  {
    category: 'Getting Started',
    q: 'Do I need a smartphone?',
    a: 'No. While the web app works best on a smartphone or computer, truck drivers can update delivery status, check job details, and receive notifications using any basic phone by dialling *384*7447# (USSD). No internet connection required.',
  },
  {
    category: 'Getting Started',
    q: 'What information do I need to register as a transporter?',
    a: 'You need your full name, phone number, vehicle type (e.g. 3-ton truck, semi-trailer), and your vehicle\'s number plate. Email address is optional.',
  },
  // Loads & Shipments
  {
    category: 'Loads & Shipments',
    q: 'How do I post a load as a shipper?',
    a: 'After logging in, go to your Shipper Dashboard, click "Post New Load", and fill in the origin, destination, cargo type, weight, and your preferred delivery date. Available transporters are notified instantly via SMS.',
  },
  {
    category: 'Loads & Shipments',
    q: 'How quickly will I find a transporter?',
    a: 'On active corridors like Nairobi–Mombasa, loads are typically accepted within 30–60 minutes during business hours. All registered transporters on that route receive an SMS alert the moment a load is posted.',
  },
  {
    category: 'Loads & Shipments',
    q: 'Can I cancel a load after posting it?',
    a: 'Yes. You can cancel a load from your dashboard before a transporter accepts it at no charge. Cancellations after acceptance may be subject to a small fee to compensate the transporter for lost time.',
  },
  // Tracking
  {
    category: 'Tracking',
    q: 'How do I track my shipment?',
    a: 'From your Shipper Dashboard, open the load and view its live status. The transporter updates status at each milestone (Picked Up, In Transit, Arrived, Delivered) via the app or USSD dial-in.',
  },
  {
    category: 'Tracking',
    q: 'Will I receive SMS notifications?',
    a: 'Yes. FreightFlow uses Africa\'s Talking SMS API to send you real-time alerts for key events: load accepted, pickup confirmed, in transit, and delivery confirmed.',
  },
  {
    category: 'Tracking',
    q: 'How does a driver update status without internet?',
    a: 'Drivers dial *384*7447# from any phone. They navigate the USSD menu to select their active load and choose the relevant status update. The change reflects immediately on the shipper\'s web dashboard.',
  },
  // Payments
  {
    category: 'Payments',
    q: 'How are transporters paid?',
    a: 'Payment is handled directly between the shipper and transporter. FreightFlow facilitates the introduction and tracks delivery confirmation. M-PESA integration for in-platform payments is on our roadmap.',
  },
  {
    category: 'Payments',
    q: 'What is the airtime reward for transporters?',
    a: 'Transporters who complete on-time deliveries automatically receive KES 20 airtime via Africa\'s Talking Airtime API. This reward is funded by FreightFlow as an incentive for reliable, punctual service.',
  },
  // Account & Security
  {
    category: 'Account & Security',
    q: 'How is my phone number protected?',
    a: 'Your phone number is the primary login identifier. It is stored securely and never sold or shared with third parties. All authentication uses one-time SMS codes via Africa\'s Talking — never email-only.',
  },
  {
    category: 'Account & Security',
    q: 'What happens if I forget my password?',
    a: 'Go to the login page and click "Forgot password?". Enter your registered phone number, receive a 6-digit reset code by SMS, and set a new password. The reset code expires in 10 minutes.',
  },
  {
    category: 'Account & Security',
    q: 'Can I have both a Shipper and a Transporter account?',
    a: 'Currently each phone number is linked to one role. If you need both roles, use a different phone number for the second account. Multi-role support is planned for a future release.',
  },
];

const SUPPORT = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    detail: 'Available Mon–Fri, 8am–6pm EAT',
    action: 'Start Chat',
    href: '/contact',
    bg: 'bg-blue-50 text-[#1E3A8A]',
  },
  {
    icon: Mail,
    title: 'Email',
    detail: 'hello@freightflow.co.ke',
    action: 'Send Email',
    href: 'mailto:hello@freightflow.co.ke',
    bg: 'bg-green-50 text-[#16A34A]',
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '+254 712 345 678',
    action: 'Call Now',
    href: 'tel:+254712345678',
    bg: 'bg-purple-50 text-purple-600',
  },
];

// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        <ChevronDown
          size={16}
          className={cn('text-gray-400 shrink-0 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FAQPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = FAQS.filter((item) => {
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch =
      !search ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-[#1E3A8A] text-white py-14 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Support</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-white/80 text-sm mb-7 max-w-lg mx-auto">
            Everything you need to know about FreightFlow. Can&apos;t find an answer? We&apos;re here to help.
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>
      </section>

      {/* Category pills */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-30 px-5 py-3">
        <div className="max-w-3xl mx-auto flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                activeCategory === cat
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ list */}
      <section className="py-12 px-5 flex-1">
        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => <AccordionItem key={item.q} q={item.q} a={item.a} />)
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No results for &ldquo;{search}&rdquo;</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                className="text-xs text-[#1E3A8A] mt-2 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Still need help? */}
      <section className="py-14 px-5 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Still need help?</h2>
            <p className="text-sm text-gray-500 mt-2">Our support team is ready to assist you.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {SUPPORT.map(({ icon: Icon, title, detail, action, href, bg }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${bg}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 mb-4">{detail}</p>
                <a
                  href={href}
                  className="inline-flex items-center justify-center px-5 h-9 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e40af] transition-colors"
                >
                  {action}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
