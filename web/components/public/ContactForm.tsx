'use client';

import { useState, useRef } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import type { ContactFormData, ContactFormErrors } from '@/types/contactForm';

const SUBJECTS = [
  'General Inquiry',
  'Technical Support',
  'Billing & Payments',
  'Partnership',
  'Press & Media',
  'Other',
];

const EMPTY_FORM: ContactFormData = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const submittedEmail = useRef('');

  function validate(): boolean {
    const e: ContactFormErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Please enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Please enter a valid email address';
    if (form.phone && !/^\+254[0-9]{9}$/.test(form.phone))
      e.phone = 'Use format +254XXXXXXXXX';
    if (!form.subject)
      e.subject = 'Please select a subject';
    if (!form.message.trim() || form.message.trim().length < 20)
      e.message = 'Message must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/contact', form);
      submittedEmail.current = form.email;
      setSent(true);
    } catch {
      setErrors({ message: 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  function setField(key: keyof ContactFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((err) => { const next = { ...err }; delete next[key]; return next; });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5"
          aria-hidden="true"
        >
          <CheckCircle size={28} className="text-[#16A34A]" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Thanks for reaching out. We&apos;ll reply to{' '}
          <strong>{submittedEmail.current}</strong> within 24 hours.
        </p>
        <button
          onClick={() => { setSent(false); setForm(EMPTY_FORM); }}
          className="mt-6 text-sm text-[#1E3A8A] hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Send us a message</h2>
      <p className="text-sm text-gray-500 mb-6">
        We read every message and reply within one business day.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Contact form">

        <div>
          <label htmlFor="cf-name" className="ff-label">Full Name</label>
          <input
            id="cf-name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="John Kamau"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'cf-name-error' : undefined}
            className={cn('ff-input', errors.name && 'ff-input-error')}
          />
          {errors.name && <p id="cf-name-error" className="ff-error" role="alert">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="cf-email" className="ff-label">Email Address</label>
          <input
            id="cf-email"
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="john@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'cf-email-error' : undefined}
            className={cn('ff-input', errors.email && 'ff-input-error')}
          />
          {errors.email && <p id="cf-email-error" className="ff-error" role="alert">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="cf-phone" className="ff-label">
            Phone Number{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="cf-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            placeholder="+254712345678"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'cf-phone-error' : undefined}
            className={cn('ff-input', errors.phone && 'ff-input-error')}
          />
          {errors.phone && <p id="cf-phone-error" className="ff-error" role="alert">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="cf-subject" className="ff-label">Subject</label>
          <select
            id="cf-subject"
            value={form.subject}
            onChange={(e) => setField('subject', e.target.value)}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? 'cf-subject-error' : undefined}
            className={cn('ff-input', errors.subject && 'ff-input-error')}
          >
            <option value="">Select a subject</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.subject && <p id="cf-subject-error" className="ff-error" role="alert">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="cf-message" className="ff-label">Message</label>
          <textarea
            id="cf-message"
            value={form.message}
            onChange={(e) => setField('message', e.target.value)}
            placeholder="Tell us how we can help you..."
            rows={5}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'cf-message-error' : undefined}
            className={cn(
              'w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400',
              'outline-none transition-colors resize-none',
              'focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20',
              errors.message && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            )}
          />
          {errors.message && <p id="cf-message-error" className="ff-error" role="alert">{errors.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full h-11 flex items-center justify-center gap-2"
          aria-busy={loading}
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={15} aria-hidden="true" /> Sending...</>
          ) : (
            <><Send size={15} aria-hidden="true" /> Send Message</>
          )}
        </button>

      </form>
    </>
  );
}
