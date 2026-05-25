import { Package, MapPin, Shield, Globe, MessageSquare, Radio, Phone, Star } from 'lucide-react';
import type { Feature, ATApiFeature } from '@/types/feature';

export const PLATFORM_FEATURES: Feature[] = [
  {
    icon: Package,
    title: 'Post Loads',
    desc: 'Create a load in under 60 seconds. Set origin, destination, cargo type, and weight — transporters are alerted instantly via SMS.',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#1E3A8A]',
  },
  {
    icon: MapPin,
    title: 'Real-time Tracking',
    desc: 'Follow your cargo from pickup to delivery. Status updates via web or USSD — no internet required for drivers.',
    iconBg: 'bg-green-50',
    iconColor: 'text-[#16A34A]',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    desc: 'Every transaction is logged. Dispute resolution built in. Ratings after every delivery keep the network trustworthy.',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Globe,
    title: 'Cross-Border Ready',
    desc: 'Support for Kenya, Uganda, Tanzania and beyond. Multi-currency, multilingual — built for the East African corridor.',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export const AT_API_FEATURES: ATApiFeature[] = [
  {
    icon: MessageSquare,
    label: 'SMS API',
    desc: 'Instant load alerts, OTP authentication, delivery confirmations to both parties.',
    iconBg: 'bg-blue-50',
    iconColor: 'text-[#1E3A8A]',
  },
  {
    icon: Radio,
    label: 'USSD API',
    desc: 'Dial *384*7447# on any basic phone. Update status without internet.',
    iconBg: 'bg-green-50',
    iconColor: 'text-[#16A34A]',
  },
  {
    icon: Phone,
    label: 'Voice API',
    desc: 'Automated call alerts for critical events — delays, disputes, high-value deliveries.',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Star,
    label: 'Airtime API',
    desc: 'KES 20 airtime reward disbursed automatically to transporters who deliver on time.',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];
