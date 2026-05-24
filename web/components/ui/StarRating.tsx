'use client';
import { useState } from 'react';

interface Props {
  value?: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}

export default function StarRating({ value = 0, onChange, readonly }: Props) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`text-2xl transition-colors ${star <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
