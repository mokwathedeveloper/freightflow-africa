import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types/testimonial';

interface TestimonialCardProps extends Testimonial {
  className?: string;
}

export default function TestimonialCard({ name, role, quote, rating, initials, avatarBg, avatarColor, className }: TestimonialCardProps) {
  return (
    <figure className={cn('bg-white rounded-xl border border-gray-200 shadow-sm p-6', className)}>
      <div className="flex gap-0.5 mb-3" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={14} className="text-amber-400 fill-amber-400" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="text-sm text-gray-600 leading-relaxed mb-5">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <div
          className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', avatarBg, avatarColor)}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}
