import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import ContactForm from '@/components/public/ContactForm';

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

export default function ContactPage() {
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
                <Icon size={18} aria-hidden="true" />
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
            <ContactForm />
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
                  <MapPin size={14} className="text-white/60 mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-white/80">Westlands Business Centre, Nairobi, Kenya</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Phone size={14} className="text-white/60 mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-white/80">+254 712 345 678</p>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Mail size={14} className="text-white/60 mt-0.5 shrink-0" aria-hidden="true" />
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
