'use client';

import React, { useState, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { getToken, getUser } from '@/services/auth.service';
import { API_BASE } from '@/services/api';

import RequestList from '@/components/property/RequestList';
import FoodRequestList from '@/components/food/FoodRequestList';

function RequestFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('propertyId');
  
  const [activeTab, setActiveTab] = useState<'stays' | 'food'>('stays');
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    setStartDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    const token = getToken();
    if (!token) {
      toast.error('Please login to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          property: propertyId,
          startDate,
          endDate: startDate, // Set end date same as start for visits
          visitTime,
          message
        })
      });

      if (res.ok) {
        toast.success('Visit request sent successfully!');
        router.push('/requests'); 
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send request');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error sending request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!propertyId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-slate-100 rounded-[2rem] w-fit mx-auto md:mx-0">
          <button 
            onClick={() => setActiveTab('stays')}
            className={`px-8 py-3 rounded-[1.5rem] text-sm font-bold transition-all ${activeTab === 'stays' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🏠 Property Visits
          </button>
          <button 
            onClick={() => setActiveTab('food')}
            className={`px-8 py-3 rounded-[1.5rem] text-sm font-bold transition-all ${activeTab === 'food' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🍱 Food Interests
          </button>
        </div>

        <div className="mt-8">
          {activeTab === 'stays' ? <RequestList /> : <FoodRequestList />}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="rounded-[40px] border border-zinc-200 bg-white p-10 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Request Visit
        </h1>
        <p className="text-zinc-500 mb-10 font-medium">
          Schedule a time to visit the property and meet the host.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Visiting Date</label>
              {mounted && (
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border-zinc-200 bg-zinc-50 p-4 text-sm font-bold dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Visiting Time</label>
              <input
                type="time"
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="w-full rounded-2xl border-zinc-200 bg-zinc-50 p-4 text-sm font-bold dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Preferred Time & Message</label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Suggest a time and ask any questions you have..."
              className="w-full rounded-2xl border-zinc-200 bg-zinc-50 p-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-3xl bg-primary py-5 text-lg font-black text-white shadow-xl shadow-primary/20 transition-all hover:opacity-90 disabled:opacity-50 active:scale-95 uppercase tracking-widest"
          >
            {isSubmitting ? 'Sending Request...' : 'Send Visit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RequestPage() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
    const u = getUser();
    if (!u) {
      router.push('/login?redirect=/requests');
    } else {
      setUser(u);
    }
  }, [router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
        <RequestFormContent />
      </Suspense>
    </div>
  );
}
