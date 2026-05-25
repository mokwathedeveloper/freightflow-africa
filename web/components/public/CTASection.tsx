import CTAButton from './CTAButton';

interface CTASectionProps {
  headline: string;
  subtext: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export default function CTASection({
  headline,
  subtext,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CTASectionProps) {
  return (
    <section className="py-16 px-5 bg-[#1E3A8A]">
      <div className="max-w-xl mx-auto text-center space-y-5">
        <h2 className="text-2xl font-bold text-white">{headline}</h2>
        <p className="text-sm text-white/70 leading-relaxed">{subtext}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <CTAButton href={primaryHref} variant="primary" size="md" showArrow>
            {primaryLabel}
          </CTAButton>
          <CTAButton href={secondaryHref} variant="outline-white" size="md">
            {secondaryLabel}
          </CTAButton>
        </div>
      </div>
    </section>
  );
}
