'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchReviews } from '@/services/review.service';
import ReviewCard from '@/components/review/ReviewCard';
import { getUser } from '@/services/auth.service';

export default function UserReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const loadData = async () => {
      const localUser = getUser();
      if (!localUser) {
        window.location.href = '/login?redirect=/reviews';
        return;
      }
      try {
        // In a real app, we'd have a fetchUserReviews(userId)
        // For now, we'll fetch some reviews and mock them
        const data = await fetchReviews('all'); 
        setReviews(data);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            My Reviews
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Manage and view your feedback for properties.</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => <div key={i} className="h-32 rounded-[32px] bg-zinc-200 animate-pulse dark:bg-zinc-800" />)}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="relative group">
                <ReviewCard review={review} />
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="p-2 rounded-xl bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50 transition-all text-sm">✏️ Edit</button>
                  <button className="p-2 rounded-xl bg-red-50 border border-red-100 shadow-sm hover:bg-red-100 transition-all text-sm text-red-600">🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-zinc-200 rounded-[40px] dark:border-zinc-800">
            <p className="text-zinc-500 font-bold">You haven't written any reviews yet.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
