'use client';

import React, { useState, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { createBooking } from '@/services/booking.service';

function RequestFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('propertyId');
  
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) {
      toast.error('No property selected');
      return;
    }

    setIsSubmitting(true);
    try {
      await createBooking({
        propertyId: propertyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        message
      });

      toast.success('Booking request sent successfully!');
      router.push('/');
    } catch (err) {
      toast.error('Error sending request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Request Booking
        </h1>
        <p className="text-zinc-500 mb-10">
          Send a message to the owner to express your interest.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Message to Owner</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the owner a bit about yourself and why you're interested in this stay..."
              className="w-full rounded-xl border-zinc-200 bg-zinc-50 p-4 text-sm focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? 'Sending Request...' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading request form...</div>}>
        <RequestFormContent />
      </Suspense>
    </div>
  );
}
