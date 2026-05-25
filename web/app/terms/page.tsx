'use client';

import { useState } from 'react';
import { FileText, Lock, Cookie, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

// ─── Content ──────────────────────────────────────────────────────────────────
type Section = { heading: string; content: string | string[] };

const TERMS_SECTIONS: Section[] = [
  {
    heading: '1. Acceptance of Terms',
    content: 'By accessing or using the FreightFlow platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree with any part of these Terms, you may not use the Service. These Terms apply to all users, including shippers, transporters, and visitors.',
  },
  {
    heading: '2. Description of Service',
    content: 'FreightFlow is a digital freight marketplace that connects shippers who need cargo transported with transporters (truck owners and drivers) across East Africa. The platform facilitates load posting, transporter matching, shipment tracking, and delivery confirmation.',
  },
  {
    heading: '3. User Accounts',
    content: [
      'You must provide accurate, current information when registering.',
      'You are responsible for maintaining the confidentiality of your password.',
      'Your phone number is your primary identifier — keep it accessible.',
      'You must notify us immediately of any unauthorised access to your account.',
      'One account per phone number. You may not create multiple accounts to circumvent platform rules.',
    ],
  },
  {
    heading: '4. Shipper Obligations',
    content: [
      'Shippers must provide accurate load details including weight, cargo type, and hazardous material status.',
      'Loads must comply with Kenyan and East African transportation regulations.',
      'Shippers are responsible for ensuring cargo is properly packaged and ready at the stated pickup time.',
      'Cancellation of an accepted load may result in a platform fee.',
    ],
  },
  {
    heading: '5. Transporter Obligations',
    content: [
      'Transporters must provide accurate vehicle information including type, capacity, and a valid Kenyan number plate.',
      'Transporters are responsible for holding valid operating licences and insurance.',
      'Once a load is accepted, transporters must fulfil the commitment or notify the shipper promptly.',
      'Transporters must maintain a minimum rating to remain active on the platform.',
    ],
  },
  {
    heading: '6. Prohibited Activities',
    content: [
      'Using the platform to facilitate illegal cargo transportation.',
      'Providing false information about loads, vehicles, or delivery status.',
      'Harassing or threatening other users.',
      'Attempting to bypass the platform for private financial arrangements after initial contact.',
      'Reverse engineering or scraping the FreightFlow platform.',
    ],
  },
  {
    heading: '7. Dispute Resolution',
    content: 'Disputes between shippers and transporters should first be raised through the FreightFlow dispute resolution system within 48 hours of the delivery event. FreightFlow will facilitate mediation but is not liable for the outcome of third-party service agreements. Unresolved disputes may be escalated to the Communications Authority of Kenya or relevant courts.',
  },
  {
    heading: '8. Limitation of Liability',
    content: 'FreightFlow is a marketplace platform and is not a carrier. We do not accept liability for loss, damage, or delay of cargo. Our liability to any user is limited to the platform fees paid in the three months preceding the claim.',
  },
  {
    heading: '9. Termination',
    content: 'We reserve the right to suspend or terminate any account that violates these Terms, engages in fraudulent activity, or receives consistently poor ratings. Users may close their accounts at any time by contacting support.',
  },
  {
    heading: '10. Governing Law',
    content: 'These Terms are governed by the laws of Kenya. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.',
  },
];

const PRIVACY_SECTIONS: Section[] = [
  {
    heading: 'Information We Collect',
    content: [
      'Account information: name, phone number, email address (optional), role.',
      'Vehicle information for transporters: type, number plate, capacity.',
      'Transaction data: loads posted, accepted, delivery status, ratings.',
      'Usage data: pages visited, features used, device type.',
      'Communications: support messages and feedback submitted.',
    ],
  },
  {
    heading: 'How We Use Your Information',
    content: [
      'To match shippers with available transporters on relevant routes.',
      'To send SMS notifications via Africa\'s Talking (load alerts, OTP, delivery confirmation).',
      'To disburse airtime rewards to qualifying transporters.',
      'To resolve disputes and enforce platform Terms.',
      'To improve our services and detect fraudulent activity.',
    ],
  },
  {
    heading: 'Information Sharing',
    content: 'We share your phone number and name with the matched counterpart (shipper or transporter) for the purpose of completing a load. We share necessary data with Africa\'s Talking to deliver SMS, USSD, Voice, and Airtime services. We do not sell your data to third parties.',
  },
  {
    heading: 'Data Retention',
    content: 'Account data is retained for the duration of your account plus 3 years for regulatory compliance. Transaction records are retained for 7 years. You may request deletion of your account data at any time subject to legal retention obligations.',
  },
  {
    heading: 'Your Rights',
    content: [
      'Access: request a copy of your personal data.',
      'Correction: update inaccurate or incomplete data.',
      'Deletion: request deletion of your data (subject to legal requirements).',
      'Portability: receive your data in a machine-readable format.',
      'Objection: object to processing for direct marketing.',
    ],
  },
  {
    heading: 'Security',
    content: 'We use industry-standard encryption (TLS 1.2+) for data in transit. Passwords are hashed using bcrypt. OTP codes expire after 10 minutes. JWT tokens are stored in httpOnly cookies to prevent XSS attacks. All API endpoints are rate-limited.',
  },
  {
    heading: 'Contact for Privacy',
    content: 'For privacy requests or concerns, email privacy@freightflow.co.ke. We will respond within 30 days. For data protection complaints, you may contact the Office of the Data Protection Commissioner of Kenya.',
  },
];

const COOKIE_SECTIONS: Section[] = [
  {
    heading: 'What Are Cookies?',
    content: 'Cookies are small text files stored on your device by your browser when you visit a website. FreightFlow uses cookies to keep you logged in, remember your preferences, and understand how you use the platform.',
  },
  {
    heading: 'Cookies We Use',
    content: [
      'Essential cookies: session authentication (JWT stored in httpOnly cookie). Cannot be disabled — the platform will not function without them.',
      'Preference cookies: your selected role and display preferences. Stored in sessionStorage, not transmitted to our servers.',
      'Analytics cookies: anonymous usage data to improve the platform. Can be disabled in your browser settings.',
    ],
  },
  {
    heading: 'No Third-Party Ad Cookies',
    content: 'FreightFlow does not use third-party advertising cookies or tracking pixels. We do not share browsing data with advertisers.',
  },
  {
    heading: 'Managing Cookies',
    content: 'You can control cookies through your browser settings. Note that disabling essential cookies will prevent you from logging in. For mobile USSD users, cookies do not apply — USSD sessions are managed server-side.',
  },
  {
    heading: 'GDPR & Kenya DPA Compliance',
    content: 'We comply with the Kenya Data Protection Act 2019 and, where applicable, the EU General Data Protection Regulation. We process data only on lawful bases (contract performance, legitimate interest, consent) and maintain records of processing activities.',
  },
];

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'terms',   label: 'Terms of Service', icon: FileText, sections: TERMS_SECTIONS,   updated: '1 May 2026' },
  { key: 'privacy', label: 'Privacy Policy',   icon: Lock,     sections: PRIVACY_SECTIONS, updated: '1 May 2026' },
  { key: 'cookies', label: 'Cookie Policy',    icon: Cookie,   sections: COOKIE_SECTIONS,  updated: '1 May 2026' },
] as const;

type TabKey = typeof TABS[number]['key'];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TermsPage() {
  const [active, setActive] = useState<TabKey>('terms');
  const tab = TABS.find((t) => t.key === active)!;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-[#1E3A8A] text-white py-12 px-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-2xl sm:text-3xl font-bold">Legal &amp; Policies</h1>
          <p className="text-white/70 text-sm mt-2">
            Last updated: <span className="font-medium text-white/90">{tab.updated}</span>
          </p>
        </div>
      </section>

      {/* Layout */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-5 py-10 flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <nav className="space-y-1 lg:sticky lg:top-24">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-left transition-colors',
                  active === key
                    ? 'bg-[#1E3A8A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon size={15} />
                <span className="flex-1">{label}</span>
                {active === key && <ChevronRight size={14} />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-200">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <tab.icon size={18} className="text-[#1E3A8A]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{tab.label}</h2>
              <p className="text-xs text-gray-400">Last updated {tab.updated}</p>
            </div>
          </div>

          <div className="space-y-8">
            {tab.sections.map(({ heading, content }) => (
              <section key={heading}>
                <h3 className="font-semibold text-gray-900 mb-3 text-base">{heading}</h3>
                {Array.isArray(content) ? (
                  <ul className="space-y-2">
                    {content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 bg-[#1E3A8A] rounded-full shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
                )}
              </section>
            ))}
          </div>

          {/* Acceptance note */}
          <div className="mt-10 p-5 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-900">Questions about our policies?</strong>{' '}
              Email us at{' '}
              <a href="mailto:legal@freightflow.co.ke" className="text-[#1E3A8A] font-medium hover:underline">
                legal@freightflow.co.ke
              </a>
              {' '}or visit our{' '}
              <a href="/contact" className="text-[#1E3A8A] font-medium hover:underline">Contact page</a>.
            </p>
          </div>
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}
