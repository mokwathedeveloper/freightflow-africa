'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home',    href: '/' },
  { label: 'About',   href: '/about' },
  { label: 'FAQ',     href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center shadow-sm">
            <Truck size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">FreightFlow</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'hover:text-gray-900 transition-colors',
                pathname === href && 'text-[#1E3A8A] font-semibold'
              )}
            >
              {label}
            </Link>
          ))}
          <Link href="/terms" className={cn(
            'hover:text-gray-900 transition-colors',
            pathname === '/terms' && 'text-[#1E3A8A] font-semibold'
          )}>
            Terms
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/auth/login"
            className="px-4 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            Sign In
          </Link>
          <Link
            href="/auth/role"
            className="px-4 h-9 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e40af] transition-colors inline-flex items-center"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 text-gray-500 hover:text-gray-800"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-5 py-4 space-y-1">
          {[...NAV_LINKS, { label: 'Terms', href: '/terms' }].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50',
                pathname === href && 'bg-blue-50 text-[#1E3A8A]'
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 flex gap-2">
            <Link href="/auth/login" onClick={() => setOpen(false)}
              className="flex-1 text-center py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
              Sign In
            </Link>
            <Link href="/auth/role" onClick={() => setOpen(false)}
              className="flex-1 text-center py-2 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
