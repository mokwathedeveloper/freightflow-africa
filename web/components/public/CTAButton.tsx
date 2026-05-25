import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline-white';
type Size = 'sm' | 'md' | 'lg';

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
  className?: string;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:       'bg-white text-[#1E3A8A] hover:bg-gray-100 shadow-sm',
  secondary:     'bg-[#1E3A8A] text-white hover:bg-blue-900',
  ghost:         'text-white/70 hover:text-white',
  'outline-white': 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
};

export default function CTAButton({
  href,
  children,
  variant = 'primary',
  size = 'md',
  showArrow = false,
  className,
  external = false,
  onClick,
}: CTAButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick}>
        {children}
        {showArrow && <ChevronRight size={15} aria-hidden="true" />}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      {children}
      {showArrow && <ChevronRight size={15} aria-hidden="true" />}
    </Link>
  );
}
