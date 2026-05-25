import type { Testimonial } from '@/types/testimonial';
import TestimonialCard from './TestimonialCard';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  return (
    <section
      className="py-16 px-5 bg-gray-50 border-t border-gray-200"
      role="region"
      aria-label="Customer testimonials"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="text-2xl font-bold text-gray-900">Trusted by logistics professionals</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
