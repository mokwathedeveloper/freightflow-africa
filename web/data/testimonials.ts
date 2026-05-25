import type { Testimonial } from '@/types/testimonial';

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'James Otieno',
    role: 'Logistics Manager, Nairobi',
    quote: 'FreightFlow cut our empty return trips by 40%. The SMS alerts mean our drivers never miss a load opportunity.',
    rating: 5,
    initials: 'JO',
    avatarBg: 'bg-blue-100',
    avatarColor: 'text-[#1E3A8A]',
  },
  {
    name: 'Amina Hassan',
    role: 'Shipper, Mombasa',
    quote: 'I can track my container from Mombasa to Kampala without calling anyone. Game changer for cross-border trade.',
    rating: 5,
    initials: 'AH',
    avatarBg: 'bg-green-100',
    avatarColor: 'text-[#16A34A]',
  },
  {
    name: 'Peter Kamau',
    role: 'Truck Owner-Operator',
    quote: 'Even on a basic phone via USSD I can update delivery status. The airtime reward is a great bonus!',
    rating: 5,
    initials: 'PK',
    avatarBg: 'bg-purple-100',
    avatarColor: 'text-purple-600',
  },
];
