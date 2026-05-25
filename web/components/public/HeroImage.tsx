import Image from 'next/image';

interface HeroImageProps {
  src: string;
  alt?: string;
}

/**
 * Drop a truck (or any hero) photo on the right side of HeroSection.
 * Usage in page.tsx:
 *   <HeroSection rightContent={<HeroImage src="/truck-hero.jpg" alt="Freight truck" />} .../>
 */
export default function HeroImage({ src, alt = 'FreightFlow hero image' }: HeroImageProps) {
  return (
    <div className="relative hidden lg:block w-full h-full min-h-[420px]">
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          priority
          sizes="(max-width: 1024px) 0px, 50vw"
        />
        {/* Subtle overlay to keep text legible if needed */}
        <div className="absolute inset-0 bg-[#1E3A8A]/10 rounded-2xl" />
      </div>
    </div>
  );
}
