'use client';

import React, { useState } from 'react';
import RatingStars from './RatingStars';
import toast from 'react-hot-toast';

import { postReview } from '@/services/review.service';

export default function ReviewForm({ propertyId }: { propertyId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await postReview({
        property: propertyId,
        rating,
        comment
      });

      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      // Refresh page to see new review
      window.location.reload();
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Your Rating
        </label>
        <RatingStars value={rating} onChange={setRating} interactive />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Your Comment
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What was your experience like?"
          className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-4 text-sm focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary py-3 font-semibold text-white transition-all hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Post Review'}
      </button>
    </form>
  );
}
