import type { LucideIcon } from 'lucide-react';

export interface TrustStat {
  value: string;
  label: string;
}

export interface HowItWorksStep {
  step: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface MarketStat {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

export interface FeatureRow {
  feature: string;
  freightflow: boolean;
  others: boolean;
  note?: string;
}
