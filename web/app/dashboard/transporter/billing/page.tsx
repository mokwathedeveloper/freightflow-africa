'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard, CheckCircle, Loader2, Download, AlertCircle,
  Zap, Shield, Star, ArrowUpRight,
} from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import api from '@/lib/api';
import { useToastStore } from '@/store/toast.store';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isCurrent: boolean;
}

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
    currentPlan: Plan;
    nextBillingDate: string;
    paymentMethod?: { last4: string; brand: string; expiry: string };
    history: BillingRecord[];
  };
}

const PLANS: Omit<Plan, 'isCurrent'>[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    currency: 'KES',
    interval: 'month',
    features: ['Up to 5 loads/month', 'SMS notifications', 'USSD access', 'Basic tracking'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 2500,
    currency: 'KES',
    interval: 'month',
    features: ['Up to 50 loads/month', 'Priority SMS', 'USSD access', 'Real-time tracking', 'Analytics dashboard'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 8000,
    currency: 'KES',
    interval: 'month',
    features: ['Unlimited loads', 'Dedicated support', 'Custom USSD menu', 'API access', 'Advanced analytics', 'Airtime rewards'],
  },
];

const PLAN_ICONS = { starter: Zap, growth: Shield, enterprise: Star };

function statusBadge(status: BillingRecord['status']) {
  if (status === 'PAID')    return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

export default function BillingPage() {
  const qc = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const { data, isLoading } = useQuery<BillingResponse>({
    queryKey: ['billing'],
    queryFn: () => api.get('/billing').then((r) => r.data),
  });

  const upgradeMut = useMutation({
    mutationFn: (planId: string) => api.post('/billing/upgrade', { planId }),
    onMutate: (planId) => setUpgrading(planId),
    onSettled: () => setUpgrading(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing'] });
      addToast('success', 'Plan updated successfully!');
    },
    onError: () => addToast('error', 'Failed to update plan. Please try again.'),
  });

  const billing = data?.data;
  const currentPlanId = billing?.currentPlan?.id ?? 'starter';
  const history = billing?.history ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Billing & Subscription</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your plan, payment method, and billing history</p>
      </div>

      {/* Current plan + payment method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Current plan */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Current Plan</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center shrink-0">
                <Star size={18} className="text-[#1E3A8A]" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">
                  {billing?.currentPlan?.name ?? 'Starter'}
                </p>
                <p className="text-sm text-gray-500">
                  {billing?.currentPlan?.price === 0
                    ? 'Free forever'
                    : `KES ${billing?.currentPlan?.price?.toLocaleString()}/month`}
                </p>
                {billing?.nextBillingDate && billing?.currentPlan?.price > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Next billing: {formatDate(billing.nextBillingDate)}
                  </p>
                )}
              </div>
              <span className="text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                Active
              </span>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment Method</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ) : billing?.paymentMethod ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
                </p>
                <p className="text-xs text-gray-500">Expires {billing.paymentMethod.expiry}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertCircle size={16} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-sm text-gray-600">No payment method on file</p>
                <button className="text-xs text-[#1E3A8A] hover:underline mt-0.5">
                  Add payment method
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const Icon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] ?? Zap;
            const isCurrent = plan.id === currentPlanId;
            const isPopular = plan.id === 'growth';
            return (
              <div
                key={plan.id}
                className={cn(
                  'rounded-xl border p-5 flex flex-col gap-4 relative transition-all',
                  isCurrent
                    ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 ring-1 ring-[#1E3A8A]/20'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                {isPopular && !isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold bg-[#1E3A8A] text-white rounded-full px-3 py-0.5 whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold bg-green-600 text-white rounded-full px-3 py-0.5 whitespace-nowrap">
                    Current Plan
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    isCurrent ? 'bg-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-500'
                  )}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <p className="text-xs text-gray-500">
                      {plan.price === 0 ? 'Free' : `KES ${plan.price.toLocaleString()}/mo`}
                    </p>
                  </div>
                </div>

                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isCurrent && upgradeMut.mutate(plan.id)}
                  disabled={isCurrent || upgrading === plan.id}
                  className={cn(
                    'w-full h-9 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5',
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-default'
                      : 'bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90 disabled:opacity-60'
                  )}
                >
                  {upgrading === plan.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : isCurrent
                      ? 'Current Plan'
                      : plan.price === 0
                        ? 'Downgrade'
                        : <><ArrowUpRight size={14} /> Upgrade</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Billing History</h3>
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
            <p className="text-xs text-gray-400 mt-1">Your invoices will appear here after your first charge.</p>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id}>
                  <td className="text-gray-500 text-xs">{formatDate(record.date)}</td>
                  <td className="text-gray-700">{record.description}</td>
                  <td className="font-medium text-gray-900">
                    {record.currency} {record.amount.toLocaleString()}
                  </td>
                  <td>
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full border',
                      statusBadge(record.status)
                    )}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    {record.invoiceUrl && (
                      <a
                        href={record.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-[#1E3A8A] hover:underline"
                      >
                        <Download size={12} /> Invoice
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
