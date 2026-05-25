import Link from 'next/link';
import { Truck, Mail, Phone, MapPin, Share2, Globe, ExternalLink } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Home',    href: '/' },
  { label: 'About',   href: '/about' },
  { label: 'FAQ',     href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Terms',   href: '/terms' },
];

const SERVICES = [
  { label: 'Load Posting',      href: '/auth/role' },
  { label: 'Real-time Tracking',href: '/auth/role' },
  { label: 'USSD Access',       href: '/#ussd' },
  { label: 'SMS Notifications', href: '/#apis' },
  { label: 'Airtime Rewards',   href: '/#apis' },
];

export default function PublicFooter() {
  return (
    <footer className="bg-[#1E3A8A] text-white">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Truck size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">FreightFlow</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              Africa&apos;s digital freight marketplace. Connecting shippers and transporters
              across Kenya — even without internet via USSD.
            </p>
            <div className="flex gap-3">
              {[Share2, Globe, ExternalLink].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Social link"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Services
            </h3>
            <ul className="space-y-2.5">
              {SERVICES.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white text-sm mb-4 uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail size={14} className="text-white/60 mt-0.5 shrink-0" />
                <span className="text-sm text-white/70">hello@freightflow.co.ke</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone size={14} className="text-white/60 mt-0.5 shrink-0" />
                <span className="text-sm text-white/70">+254 712 345 678</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="text-white/60 mt-0.5 shrink-0" />
                <span className="text-sm text-white/70">Westlands, Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© 2026 FreightFlow · Africa&apos;s Talking Hackathon</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white/80 transition-colors">Terms of Service</Link>
            <Link href="/terms#privacy" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
