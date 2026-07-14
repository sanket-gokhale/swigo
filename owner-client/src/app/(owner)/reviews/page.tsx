'use client';
import React, { useEffect, useState } from 'react';
import { getAuthJSON } from '@/services/api';

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getAuthJSON('/reviews/owner');
        setReviews(data.data || data || []);
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <div className="space-y-6">
    {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-3xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Property Reviews</h1>
        <p className="mt-2 text-sm sm:text-base text-zinc-500">See what your tenants are saying about their stays.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-zinc-500">No reviews yet. New reviews will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 flex-shrink-0">
                    {review.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{review.user?.name || 'Anonymous'}</h3>
                    <p className="text-xs text-zinc-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-700 flex-shrink-0">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{review.rating}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Property</p>
                <p className="text-sm font-bold text-primary">{review.property?.title}</p>
              </div>

              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed italic text-sm sm:text-base">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
