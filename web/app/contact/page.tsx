'use client';

import { useState } from 'react';
import { Mail, Phone, MessageCircle, MapPin, Send, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

const CONTACT_CARDS = [
  {
    icon: Mail,
    title: 'Email',
    detail: 'hello@freightflow.co.ke',
    sub: 'We reply within 24 hours',
    href: 'mailto:hello@freightflow.co.ke',
    bg: 'bg-blue-50 text-[#1E3A8A]',
  },
  {
    icon: Phone,
    title: 'Phone',
    detail: '+254 712 345 678',
    sub: 'Mon–Fri, 8am–6pm EAT',
    href: 'tel:+254712345678',
    bg: 'bg-green-50 text-[#16A34A]',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    detail: 'Chat with our team',
    sub: 'Available during business hours',
    href: '#',
    bg: 'bg-purple-50 text-purple-600',
  },
  {
    icon: MapPin,
    title: 'Office',
    detail: 'Westlands, Nairobi',
    sub: 'Kenya — East Africa HQ',
    href: 'https://maps.google.com/?q=Westlands+Nairobi',
    bg: 'bg-amber-50 text-amber-600',
  },
];

const SUBJECTS = [
  'General Inquiry',
  'Technical Support',
  'Billing & Payments',
  'Partnership',
  'Press & Media',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address';
    if (form.phone && !/^\+254[0-9]{9}$/.test(form.phone)) e.phone = 'Use format +254XXXXXXXXX';
    if (!form.subject) e.subject = 'Please select a subject';
    if (!form.message.trim() || form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  }

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((err) => { const next = { ...err }; delete next[key]; return next; });
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="bg-[#1E3A8A] text-white py-14 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Get in Touch</h1>
          <p className="text-white/80 text-sm max-w-lg mx-auto">
            Have a question, partnership idea, or need help? Our team is happy to hear from you.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_CARDS.map(({ icon: Icon, title, detail, sub, href, bg }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow text-center group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 ${bg}`}>
                <Icon size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{title}</h3>
              <p className="text-xs text-gray-700 font-medium">{detail}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-8 px-5 pb-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">

          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle size={28} className="text-[#16A34A]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
                <p className="text-sm text-gray-500 max-w-xs">
                  Thanks for reaching out. We&apos;ll reply to <strong>{form.email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="mt-6 text-sm text-[#1E3A8A] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Send us a message</h2>
                <p className="text-sm text-gray-500 mb-6">We read every message and reply within one business day.</p>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label className="ff-label">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => field('name', e.target.value)}
                      placeholder="John Kamau"
                      className={cn('ff-input', errors.name && 'ff-input-error')}
                    />
                    {errors.name && <p className="ff-error">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="ff-label">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => field('email', e.target.value)}
                      placeholder="john@example.com"
                      className={cn('ff-input', errors.email && 'ff-input-error')}
                    />
                    {errors.email && <p className="ff-error">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="ff-label">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => field('phone', e.target.value)}
                      placeholder="+254712345678"
                      className={cn('ff-input', errors.phone && 'ff-input-error')}
                    />
                    {errors.phone && <p className="ff-error">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="ff-label">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => field('subject', e.target.value)}
                      className={cn('ff-input', errors.subject && 'ff-input-error')}
                    >
                      <option value="">Select a subject</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subject && <p className="ff-error">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="ff-label">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => field('message', e.target.value)}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      className={cn(
                        'w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400',
                        'outline-none transition-colors resize-none',
                        'focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20',
                        errors.message && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      )}
                    />
                    {errors.message && <p className="ff-error">{errors.message}</p>}
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full h-11">
                    {loading ? (
                      <><Loader2 className="animate-spin" size={15} /> Sending...</>
                    ) : (
                      <><Send size={15} /> Send Message</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Map placeholder + extra info */}
          <div className="flex flex-col gap-5">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex-1 min-h-64 bg-gray-100 relative">
              <iframe
                title="FreightFlow HQ"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.819032012!2d36.8052!3d-1.2637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c0a1f9de7%3A0x4de3f8a6a8e1e4b4!2sWestlands%2C+Nairobi!5e0!3m2!1sen!2ske!4v1600000000000"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '260px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Office info card */}
            <div className="bg-[#1E3A8A] rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-3">FreightFlow HQ</h3>
              <div className="space-y-2.5">
                <div className="flex gap-2.5 items-start">
                  <MapPin size={14} className="text-white/60 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/80">Westlands Business Centre, Nairobi, Kenya</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Phone size={14} className="text-white/60 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/80">+254 712 345 678</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Mail size={14} className="text-white/60 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/80">hello@freightflow.co.ke</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/60">
                Business hours: Monday–Friday, 8:00am–6:00pm EAT
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
