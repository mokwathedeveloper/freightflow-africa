import { Zap } from 'lucide-react';
import CTAButton from './CTAButton';
import HeroMockup from './HeroMockup';

interface HeroSectionProps {
  badge?: string;
  headline: string;
  greenSpan: string;
  subheadline: string;
}

export default function HeroSection({ badge, headline, greenSpan, subheadline }: HeroSectionProps) {
  return (
    <section className="relative bg-[#1E3A8A] text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative max-w-6xl mx-auto px-5 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          {badge && (
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap size={12} aria-hidden="true" /> {badge}
            </div>
          )}
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5">
            {headline}
            <br />
            <span style={{ color: '#86efac' }}>{greenSpan}</span>
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-lg leading-relaxed">{subheadline}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <CTAButton href="/auth/role" variant="primary" size="md" showArrow>
              Sign Up Free
            </CTAButton>
            <CTAButton href="#features" variant="outline-white" size="md">
              Learn More
            </CTAButton>
            <CTAButton href="/contact" variant="ghost" size="md" showArrow>
              Request Demo
            </CTAButton>
          </div>
        </div>
        <HeroMockup />
      </div>
    </section>
  );
}
