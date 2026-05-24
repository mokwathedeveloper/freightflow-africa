'use client';

import { useState } from 'react';
import { Check, CreditCard, Plus, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$29',
    period: '/month',
    description: 'For small teams getting started',
    features: [
      'Up to 100 loads/month',
      '5 user accounts',
      'Basic reporting',
      'Email support',
      'Basic reporting',
    ],
    cta: 'Choose Plan',
    ctaStyle: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    current: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$79',
    period: '/month',
    description: 'For growing businesses',
    features: [
      'Up to 500 loads/month',
      '15 user accounts',
      'Priority email support',
      'Advanced analytics',
      'API access',
    ],
    cta: 'Upgrade to Standard',
    ctaStyle: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    current: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$149',
    period: '/month',
    description: 'For scaling operations',
    features: [
      'Unlimited loads',
      'Unlimited users',
      'Priority support 24/7',
      'Custom integrations',
      'Dedicated account manager',
    ],
    cta: 'Manage Plan',
    ctaStyle: 'bg-[#1E3A8A] text-white hover:bg-[#1e3a8a]/90',
    current: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large enterprises',
    features: [
      'Custom load limits',
      'Unlimited users',
      'SLA guarantee',
      'Custom integrations',
      'On-site deployment',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'border border-gray-200 text-gray-700 hover:bg-gray-50',
    current: false,
  },
];

const INVOICES = [
  { id: 'INV-2024-0034', date: 'May 23, 2024', plan: 'Premium (Monthly)', amount: '$149.00', status: 'Paid',    renewal: 'Jun 23, 2024' },
  { id: 'INV-2024-0025', date: 'Apr 23, 2024', plan: 'Premium (Monthly)', amount: '$149.00', status: 'Paid',    renewal: 'May 23, 2024' },
  { id: 'INV-2024-0018', date: 'Mar 23, 2024', plan: 'Premium (Monthly)', amount: '$149.00', status: 'Paid',    renewal: 'Apr 23, 2024' },
  { id: 'INV-2024-0009', date: 'Feb 23, 2024', plan: 'Premium (Monthly)', amount: '$149.00', status: 'Due',     renewal: 'Mar 23, 2024' },
  { id: 'INV-2024-0001', date: 'Jan 23, 2024', plan: 'Standard (Monthly)', amount: '$79.00', status: 'Paid',    renewal: 'Feb 23, 2024' },
];

function statusBadge(s: string) {
  if (s === 'Paid') return 'bg-green-50 text-green-700';
  if (s === 'Due')  return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-600';
}

export default function AdminSubscriptionsPage() {
  const [selected, setSelected] = useState('premium');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your plan, billing information, and payment methods.</p>
        </div>
        <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          Current user is highlighted
        </div>
      </div>

      {/* Plan heading */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">Choose Your Plan</h3>
        <p className="text-sm text-gray-500 mt-0.5">Select the plan that best fits your business needs.</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'relative rounded-xl border-2 p-5 flex flex-col transition-all cursor-pointer',
              plan.current
                ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
              selected === plan.id && !plan.current && 'border-[#1E3A8A]/40'
            )}
            onClick={() => setSelected(plan.id)}
          >
            {plan.current && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#16A34A] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                  CURRENT PLAN
                </span>
              </div>
            )}

            <div className="mb-4">
              <p className={cn('text-base font-bold', plan.current ? 'text-white' : 'text-gray-900')}>{plan.name}</p>
              <p className={cn('text-xs mt-0.5', plan.current ? 'text-white/70' : 'text-gray-500')}>{plan.description}</p>
            </div>

            <div className="mb-5">
              <span className={cn('text-3xl font-bold', plan.current ? 'text-white' : 'text-gray-900')}>{plan.price}</span>
              {plan.period && <span className={cn('text-sm ml-1', plan.current ? 'text-white/70' : 'text-gray-500')}>{plan.period}</span>}
            </div>

            <ul className="space-y-2 flex-1 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs">
                  <Check size={13} className={cn('shrink-0 mt-0.5', plan.current ? 'text-white/80' : 'text-[#16A34A]')} />
                  <span className={plan.current ? 'text-white/80' : 'text-gray-600'}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className={cn(
                'w-full h-9 rounded-lg text-sm font-medium transition-colors',
                plan.current
                  ? 'bg-white text-[#1E3A8A] hover:bg-white/90'
                  : plan.ctaStyle
              )}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Billing & Invoices + Payment Methods */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Billing table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <CreditCard size={15} className="text-[#1E3A8A]" />
            <h3 className="text-sm font-semibold text-gray-900">Billing &amp; Invoices</h3>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Next Renewal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-gray-700">{inv.id}</td>
                  <td className="text-xs text-gray-600">{inv.date}</td>
                  <td className="text-xs text-gray-600">{inv.plan}</td>
                  <td className="text-xs font-semibold text-gray-900">{inv.amount}</td>
                  <td>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusBadge(inv.status))}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-xs text-gray-600">{inv.renewal}</td>
                  <td>
                    <button className="flex items-center gap-1 text-xs text-[#1E3A8A] hover:underline">
                      <ExternalLink size={11} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-gray-100">
            <button className="text-xs text-[#1E3A8A] hover:underline">View all invoices</button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Payment Methods</h3>

          {/* Stripe card */}
          <div className="border border-[#1E3A8A]/30 rounded-xl p-4 bg-[#1E3A8A]/5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 rounded bg-[#1E3A8A] flex items-center justify-center">
                <CreditCard size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Stripe</p>
                <p className="text-xs text-gray-500">Visa •••• 4242</p>
              </div>
            </div>
            <span className="text-xs font-medium bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full">Default</span>
          </div>

          <button className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <Plus size={15} /> Add Payment Method
          </button>

          <p className="text-xs text-gray-400">
            Your payment information is encrypted and stored securely. We never store raw card data.
          </p>
        </div>
      </div>
    </div>
  );
}
