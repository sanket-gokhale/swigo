'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { getToken, getUser } from '@/services/auth.service';
import { API_BASE } from '@/services/api';
import { fetchPropertyById } from '@/services/property.service';
import { Property } from '@/types/property';

import RequestList from '@/components/property/RequestList';
import FoodRequestList from '@/components/food/FoodRequestList';

function RequestFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('propertyId');
  
  const [activeTab, setActiveTab] = useState<'stays' | 'food'>('stays');
  const [property, setProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStartDate(new Date().toISOString().split('T')[0]);

    if (propertyId) {
      setLoadingProperty(true);
      fetchPropertyById(propertyId)
        .then((data) => {
          setProperty(data);
        })
        .catch((err) => {
          console.error('Failed to load property details for request', err);
          toast.error('Could not load property details');
        })
        .finally(() => {
          setLoadingProperty(false);
        });
    }
  }, [propertyId]);

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

  // If no specific property is being requested, show My Requests lists
  if (!propertyId) {
    return (
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header & Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                My Requests
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Track your property visit requests and food service interests.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1.5 bg-slate-100/80 rounded-2xl w-fit">
              <button 
                onClick={() => setActiveTab('stays')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'stays' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏠</span>
                <span>Property Visits</span>
              </button>
              <button 
                onClick={() => setActiveTab('food')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'food' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🍱</span>
                <span>Food Interests</span>
              </button>
            </div>
          </div>

          <div>
            {activeTab === 'stays' ? <RequestList /> : <FoodRequestList />}
          </div>
        </div>
      </main>
    );
  }

  const propertyImages = property?.images && property.images.length > 0 ? property.images : ['/hostel.jpeg'];
  const coverImage = propertyImages[activeImageIndex] || propertyImages[0];

  return (
    <main className="flex-1 mx-auto max-w-6xl w-full px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link 
          href={`/property/${propertyId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Back to Property</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Property Preview Card with Images */}
        <div className="lg:col-span-5 w-full">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Property Details
              </span>
              {property?.type && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                  {property.type}
                </span>
              )}
            </div>

            {/* Images Showcase */}
            {loadingProperty ? (
              <div className="aspect-[4/3] rounded-2xl bg-slate-100 animate-pulse w-full" />
            ) : (
              <div className="space-y-2">
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-inner group">
                  <img
                    src={coverImage}
                    alt={property?.title || 'Property'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold">
                    ₹{property?.price || 'N/A'}<span className="text-[10px] font-normal text-slate-200">/mo</span>
                  </div>
                </div>

                {/* Thumbnails if multiple images exist */}
                {propertyImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {propertyImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative h-14 w-18 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIndex === idx ? 'border-blue-600 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title & Info */}
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {property?.title || 'Loading property...'}
              </h2>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600 shrink-0">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate">
                  {[property?.address, property?.area, property?.city].filter(Boolean).join(', ') || property?.location || 'Location details'}
                </span>
              </div>
            </div>

            {/* Key Features Badges */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              {property?.genderPreference && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                  <span className="text-slate-400">👤</span>
                  <span className="font-bold text-slate-700">{property.genderPreference} Preference</span>
                </div>
              )}
              {property?.contactNumber && (
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                  <span className="text-slate-400">📞</span>
                  <span className="font-bold text-slate-700 truncate">{property.contactNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Request Visit / Booking Form */}
        <div className="lg:col-span-7 w-full">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2">
                <span>🗓️</span>
                <span>Instant Scheduling</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Request Visit & Meet Host
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                Pick a date and time to visit the property in person and finalize your stay.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visiting Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Visiting Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Visiting Time */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Visiting Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Message / Special Notes</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself, mention your requirements or any questions you have for the host..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 2 11 13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    <span>Send Visit Request</span>
                  </>
                )}
              </button>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-around text-slate-500 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Free to request</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Direct host contact</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Verified listing</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
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
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading request page...</div>}>
        <RequestFormContent />
      </Suspense>
      <Footer />
    </div>
  );
}

