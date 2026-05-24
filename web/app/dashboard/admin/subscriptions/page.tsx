'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CreditCard, Plus, Loader2, ArrowUpRight } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

interface BillingRecord {
  id: string;
  description: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'FAILED';
  date: string;
  invoiceUrl?: string;
}

interface BillingResponse {
  data: {
    currentPlan: { id: string; name: string; price: number; currency: string };
    nextBillingDate: string | null;
    paymentMethod?: { last4: string; brand: string; expiry: string } | null;
    history: BillingRecord[];
  };
}

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$29',
    period: '/month',
    description: 'For small teams getting started',
    features: ['Up to 100 loads/month', '5 user accounts', 'Basic reporting', 'Email support'],
    cta: 'Choose Plan',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$79',
    period: '/month',
    description: 'For growing businesses',
    features: ['Up to 500 loads/month', '15 user accounts', 'Priority email support', 'Advanced analytics', 'API access'],
    cta: 'Upgrade to Standard',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$149',
    period: '/month',
    description: 'For scaling operations',
    features: ['Unlimited loads', 'Unlimited users', 'Priority support 24/7', 'Custom integrations', 'Dedicated account manager'],
    cta: 'Manage Plan',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large enterprises',
    features: ['Custom load limits', 'Unlimited users', 'SLA guarantee', 'Custom integrations', 'On-site deployment'],
    cta: 'Contact Sales',
  },
];

// Map admin plan IDs to billing API plan IDs
const PLAN_MAP: Record<string, string> = {
  basic:      'starter',
  standard:   'growth',
  premium:    'enterprise',
  enterprise: 'enterprise',
};

function statusBadge(s: string) {
  if (s === 'PAID' || s === 'Paid') return 'bg-green-50 text-green-700';
  if (s === 'PENDING' || s === 'Due') return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-600';
}

export default function AdminSubscriptionsPage() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data, isLoading } = useQuery<BillingResponse>({
    queryKey: ['billing'],
    queryFn: () => api.get('/billing').then((r) => r.data),
  });

  const upgradeMut = useMutation({
    mutationFn: (planId: string) => api.post('/billing/upgrade', { planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      addToast('success', 'Plan updated successfully!');
    },
    onError: () => addToast('error', 'Failed to update plan'),
  });

  const billing = data?.data;
  const currentPlanId = billing?.currentPlan?.id ?? 'starter';
  const history = billing?.history ?? [];

  // Map billing plan ID back to display plan
  const currentDisplayId = Object.entries(PLAN_MAP).find(([, v]) => v === currentPlanId)?.[0] ?? 'basic';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your plan, billing information, and payment methods.</p>
        </div>
        {billing && (
          <div className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            Current: <span className="font-semibold text-gray-900">{billing.currentPlan?.name}</span>
            {billing.nextBillingDate && ` · renews ${formatDate(billing.nextBillingDate)}`}
          </div>
        )}
      </div>

      {/* Plan heading */}
      <div>
        <h3 className="text-base font-semibold text-gray-900">Choose Your Plan</h3>
        <p className="text-sm text-gray-500 mt-0.5">Select the plan that best fits your business needs.</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentDisplayId;
          return (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-xl border-2 p-5 flex flex-col transition-all',
                isCurrent
                  ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              )}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#16A34A] text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                    CURRENT PLAN
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className={cn('text-base font-bold', isCurrent ? 'text-white' : 'text-gray-900')}>{plan.name}</p>
                <p className={cn('text-xs mt-0.5', isCurrent ? 'text-white/70' : 'text-gray-500')}>{plan.description}</p>
              </div>

              <div className="mb-5">
                <span className={cn('text-3xl font-bold', isCurrent ? 'text-white' : 'text-gray-900')}>{plan.price}</span>
                {plan.period && <span className={cn('text-sm ml-1', isCurrent ? 'text-white/70' : 'text-gray-500')}>{plan.period}</span>}
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check size={13} className={cn('shrink-0 mt-0.5', isCurrent ? 'text-white/80' : 'text-[#16A34A]')} />
                    <span className={isCurrent ? 'text-white/80' : 'text-gray-600'}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrent && upgradeMut.mutate(PLAN_MAP[plan.id])}
                disabled={isCurrent || upgradeMut.isPending}
                className={cn(
                  'w-full h-9 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                  isCurrent
                    ? 'bg-white text-[#1E3A8A] hover:bg-white/90'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60'
                )}
              >
                {upgradeMut.isPending && !isCurrent
                  ? <Loader2 size={14} className="animate-spin" />
                  : isCurrent
                    ? 'Current Plan'
                    : <><ArrowUpRight size={14} /> {plan.cta}</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Billing & Payment */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Billing history */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <CreditCard size={15} className="text-[#1E3A8A]" />
            <h3 className="text-sm font-semibold text-gray-900">Billing &amp; Invoices</h3>
          </div>

          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                  <div className="h-3 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded flex-1" />
                  <div className="h-5 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto text-gray-300 mb-3" size={28} />
              <p className="text-sm text-gray-500">No billing records yet</p>
            </div>
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((inv) => (
                  <tr key={inv.id}>
                    <td className="text-xs text-gray-600">{formatDate(inv.date)}</td>
                    <td className="text-xs text-gray-600">{inv.description}</td>
                    <td className="text-xs font-semibold text-gray-900">{inv.currency} {inv.amount.toLocaleString()}</td>
                    <td>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusBadge(inv.status))}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      {inv.invoiceUrl && (
                        <a href={inv.invoiceUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-[#1E3A8A] hover:underline">
                          View
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Payment Methods</h3>

          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-14 bg-gray-100 rounded-xl" />
            </div>
          ) : billing?.paymentMethod ? (
            <div className="border border-[#1E3A8A]/30 rounded-xl p-4 bg-[#1E3A8A]/5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-[#1E3A8A] flex items-center justify-center">
                  <CreditCard size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {billing.paymentMethod.brand}
                  </p>
                  <p className="text-xs text-gray-500">•••• {billing.paymentMethod.last4}</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full">Default</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No payment method on file.</p>
          )}

          <button className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <Plus size={15} /> Add Payment Method
          </button>

          <p className="text-xs text-gray-400">
            Payment information is encrypted and stored securely.
          </p>
        </div>
      </div>
    </div>
  );
}
