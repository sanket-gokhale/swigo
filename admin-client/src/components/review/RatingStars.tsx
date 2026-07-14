'use client';

import React from 'react';

interface Props {
  value?: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
}

export default function RatingStars({ value = 0, onChange, interactive = false }: Props) {
  const handleClick = (rating: number) => {
    if (interactive && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={!interactive}
          className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
