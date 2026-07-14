import React from 'react';
import RatingStars from './RatingStars';

interface Review {
  _id: string;
  author?: string;
  user?: { name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewCard({ review }: { review: Review }) {
  const authorName = review.user?.name || review.author || 'Anonymous';
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="py-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500 dark:bg-zinc-800">
            {authorName[0].toUpperCase()}
          </div>
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">{authorName}</h4>
            <span className="text-xs text-zinc-500">{date}</span>
          </div>
        </div>
        <RatingStars value={review.rating} />
      </div>
      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
        "{review.comment}"
      </p>
    </div>
  );
}
