'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchPropertyById, fetchProperties } from '@/services/property.service';
import { fetchReviews } from '@/services/review.service';
import ReviewCard from '@/components/review/ReviewCard';
import ReviewForm from '@/components/review/ReviewForm';
import RatingStars from '@/components/review/RatingStars';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types/property';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { postAuthJSON } from '@/services/api';
import toast from 'react-hot-toast';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [requestingFood, setRequestingFood] = useState(false);
  
  // Gallery states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleFoodRequest = async () => {
    if (!property?.linkedTiffinService) {
      toast.error('No tiffin provider linked to this property');
      return;
    }
    
    setRequestingFood(true);
    try {
      const tiffinId = property.linkedTiffinService.id || property.linkedTiffinService._id;
      await postAuthJSON('/tiffins/interest', {
        tiffin: tiffinId,
        requestType: 'property-linked',
        message: `Interested in food service at ${property.title}`
      });

      toast.success('Food service request sent!');
    } catch (err) {
      toast.error('Failed to send food request');
    } finally {
      setRequestingFood(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!id) return;
      try {
        // 1. Fetch main property data first for instant page rendering
        const propData = await fetchPropertyById(id as string);
        if (!isMounted) return;
        setProperty(propData);
        setLoading(false); // Instantly render page

        // 2. Concurrently fetch secondary data (reviews & similar properties) in background
        if (propData) {
          Promise.all([
            fetchReviews(id as string).catch(() => []),
            fetchProperties().catch(() => [])
          ]).then(([reviewsData, allProps]) => {
            if (!isMounted) return;
            setReviews(reviewsData || []);
            const similar = (allProps || [])
              .filter(p => p._id !== id)
              .sort((a, b) => {
                if (a.type === propData.type && b.type !== propData.type) return -1;
                if (a.type !== propData.type && b.type === propData.type) return 1;
                return 0;
              })
              .slice(0, 3);
            setSimilarProperties(similar);
          });
        }
      } catch (err) {
        console.error('Error loading property detail:', err);
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent animate-spin rounded-full" />
            <p className="text-xs font-bold text-slate-500">Loading stay details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-24 px-4">
          <div className="text-center max-w-md p-8 rounded-3xl border border-slate-200 bg-slate-50/50">
            <div className="text-4xl mb-3">🏡</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Property Not Found</h1>
            <p className="text-xs text-slate-500 mb-6">The stay you are looking for might have been removed or is unavailable.</p>
            <Link
              href="/search"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all inline-block"
            >
              Browse Other Stays
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Ensure we have at least 3 fallback/real images
  const defaultImages = ['/hostel.jpeg', '/room.jpeg', '/flat.jpeg'];
  const rawImages = property.images && property.images.length > 0 ? property.images : defaultImages;
  const images = rawImages.length >= 3 
    ? rawImages 
    : [...rawImages, ...defaultImages.slice(0, 3 - rawImages.length)];

  const amenityIcons: Record<string, string> = {
    'WiFi': '📶',
    'Wifi': '📶',
    'AC': '❄️',
    'Air Conditioning': '❄️',
    'Attached Bathroom': '🚿',
    'Geyser': '♨️',
    'Hot Water': '♨️',
    'Power Backup': '⚡',
    'CCTV': '📹',
    'Security': '🛡️',
    '24/7 Security': '🛡️',
    'Laundry': '🧺',
    'Washing Machine': '🧺',
    'Cleaning': '🧹',
    'Housekeeping': '🧹',
    'Parking': '🚗',
    'Bike Parking': '🏍️',
    'RO Water': '💧',
    'Drinking Water': '💧',
    'TV': '📺',
    'Television': '📺',
    'Refrigerator': '🧊',
    'Fridge': '🧊',
    'Bed & Mattress': '🛏️',
    'Wardrobe': '🚪',
    'Cupboard': '🚪',
    'Study Table': '📚',
    'Balcony': '🪴',
    'Food': '🍱',
    'Meals': '🍱',
    'Gym': '🏋️',
    'Lift': '🛗',
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 pt-24 sm:pt-28 pb-24 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb & Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Back to search</span>
            </Link>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: property.title,
                      text: `Check out this stay: ${property.title}`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }
                }}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>

              <button 
                onClick={() => {
                  setSaved(!saved);
                  toast.success(saved ? 'Removed from saved' : 'Saved to favorites!');
                }}
                className={`h-9 px-3 rounded-xl border transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                  saved 
                    ? 'bg-rose-50 border-rose-200 text-rose-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{saved ? '❤️' : '🤍'}</span>
                <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Title and Top Highlights */}
          <div className="mb-6 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100/80">
                {property.type}
              </span>
              {property.genderPreference && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                  {property.genderPreference} Only
                </span>
              )}
              {property.hasFoodService && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/80 flex items-center gap-1">
                  <span>🍱</span>
                  <span>Food Available</span>
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100/80 flex items-center gap-1">
                <span>⭐</span>
                <span>{property.averageRating ? property.averageRating.toFixed(1) : '4.8'}</span>
                <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {property.title}
            </h1>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600 shrink-0">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>
                {[property.address, property.area, property.city, property.pincode].filter(Boolean).join(', ') || property.location}
              </span>
            </div>
          </div>

          {/* 3 Images Gallery Showcase */}
          <section className="mb-10">
            {/* Desktop 3-Image Grid Layout */}
            <div className="hidden md:grid grid-cols-3 gap-3.5 h-[420px] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80">
              {/* Main Big Photo (Left 2 Columns) */}
              <div 
                onClick={() => { setActiveImageIndex(0); setIsLightboxOpen(true); }}
                className="col-span-2 relative h-full cursor-pointer overflow-hidden group bg-slate-100"
              >
                <img 
                  src={images[0]} 
                  alt={`${property.title} - Main View`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                  <span className="text-white text-xs font-bold bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                    Click to view full photo
                  </span>
                </div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Main View</span>
                </div>
              </div>

              {/* Right Stacked 2 Photos */}
              <div className="col-span-1 grid grid-rows-2 gap-3.5 h-full">
                {/* Photo 2 (Top Right) */}
                <div 
                  onClick={() => { setActiveImageIndex(1); setIsLightboxOpen(true); }}
                  className="relative h-full cursor-pointer overflow-hidden group bg-slate-100"
                >
                  <img 
                    src={images[1]} 
                    alt={`${property.title} - Photo 2`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl">View</span>
                  </div>
                </div>

                {/* Photo 3 (Bottom Right) */}
                <div 
                  onClick={() => { setActiveImageIndex(2); setIsLightboxOpen(true); }}
                  className="relative h-full cursor-pointer overflow-hidden group bg-slate-100"
                >
                  <img 
                    src={images[2]} 
                    alt={`${property.title} - Photo 3`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl">View</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                    <span>All Photos (3)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Image Gallery with Selectable Chips */}
            <div className="md:hidden space-y-3">
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-100"
              >
                <img 
                  src={images[activeImageIndex]} 
                  alt={`${property.title} - View ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl">
                  {activeImageIndex + 1} / {images.length}
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  Tap to expand
                </div>
              </div>

              {/* Mobile 3 Thumbnails */}
              <div className="grid grid-cols-3 gap-2">
                {images.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx 
                        ? 'border-blue-600 ring-2 ring-blue-500/20 scale-[0.98]' 
                        : 'border-transparent opacity-75'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Main Content & Sidebar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Main Information Column */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Quick Logistics & Price Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-slate-50/80 border border-slate-200/70 shadow-sm">
                <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-slate-400 text-xs block mb-0.5">Electricity</span>
                  <p className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1">
                    <span>⚡</span> {property.electricityBill || 'Metered'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-slate-400 text-xs block mb-0.5">Water Supply</span>
                  <p className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1">
                    <span>🚰</span> {property.waterSupplyTime || '24x7'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-slate-400 text-xs block mb-0.5">Water Charges</span>
                  <p className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1">
                    <span>💧</span> {property.waterBill || 'Included'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-slate-400 text-xs block mb-0.5">Maintenance</span>
                  <p className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1">
                    <span>🛠️</span> {property.maintenance || 'Included'}
                  </p>
                </div>
              </div>

              {/* About Stay */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-3">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>📖</span> About this stay
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {property.description || "Experience comfortable, hassle-free living in this verified property. Designed specifically for students and working professionals seeking safe, clean, and well-connected accommodation."}
                </p>
              </div>

              {/* Included Amenities Grid */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>✨</span> Amenities & Facilities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(property.amenities && property.amenities.length > 0 
                    ? property.amenities 
                    : ['WiFi', 'Air Conditioning', 'Power Backup', 'Security', 'Laundry', 'Housekeeping', 'RO Water']
                  ).map(item => {
                    const icon = amenityIcons[item] || '✔️';
                    return (
                      <div 
                        key={item} 
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100/70 transition-colors"
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="truncate">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* In-House Food Service or External Tiffin suggestion */}
              {property.hasFoodService ? (
                <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/20">
                        🍱
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">In-House Meal Service</h3>
                        <p className="text-xs font-bold text-emerald-700">Fresh daily meals prepared inside premises</p>
                      </div>
                    </div>
                    {property.foodCharges && (
                      <div className="bg-white px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm">
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Meal Plan</span>
                        <span className="text-sm font-black text-emerald-800">₹{property.foodCharges}/mo</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1 text-xs">
                      <span className="font-extrabold uppercase text-slate-400 tracking-wider">Kitchen Details</span>
                      <p className="font-bold text-slate-800">{property.linkedTiffinService?.name || 'In-House Mess / Dining'}</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        {property.linkedTiffinService?.description || 'Hygienic breakfast, lunch, and dinner options prepared under strict hygiene standards.'}
                      </p>
                    </div>

                    <div className="flex flex-col justify-between gap-3">
                      <div className="p-3 bg-white rounded-xl border border-emerald-100/80 text-xs">
                        <span className="font-bold text-slate-400 block mb-0.5 text-[10px] uppercase">Today's Special</span>
                        <p className="text-slate-700 italic font-medium">
                          &quot;{property.linkedTiffinService?.menu?.[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] || 'Healthy Balanced Thali'}&quot;
                        </p>
                      </div>
                      <button 
                        onClick={handleFoodRequest}
                        disabled={requestingFood}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {requestingFood ? 'Sending...' : 'Request Meal Plan Access'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
                      🍱
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-800">Need Tiffin Services Nearby?</h4>
                      <p className="text-xs text-slate-500">Explore authentic homestyle tiffins delivering straight to this location.</p>
                    </div>
                  </div>
                  <Link 
                    href="/food" 
                    className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center shadow-md shadow-blue-500/20 transition-all shrink-0"
                  >
                    View Tiffins
                  </Link>
                </div>
              )}

              {/* Host / Owner Card */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>👤</span> Host & Verification
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                    <span>✓</span> Verified Host
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                      {property.owner?.name?.charAt(0)?.toUpperCase() || 'H'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{property.owner?.name || 'Property Host'}</p>
                      <p className="text-xs text-slate-400 font-medium">Response rate: 98% • Usually responds within 15 min</p>
                    </div>
                  </div>

                  {property.contactNumber && (
                    <div className="flex items-center gap-2">
                      <a 
                        href={`tel:${property.contactNumber}`}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>📞</span>
                        <span>Call Host</span>
                      </a>
                      <a 
                        href={`https://wa.me/${property.contactNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>💬</span>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span>⭐</span> Tenant Reviews
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Real experiences from verified residents</p>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-100">
                    <span className="text-base font-black text-amber-700">{property.averageRating?.toFixed(1) || '4.8'}</span>
                    <RatingStars value={property.averageRating || 4.8} />
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))
                  ) : (
                    <div className="py-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-6">
                      <p className="text-xs font-bold text-slate-600">No community reviews submitted yet.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Be the first to share your experience staying here!</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Write a Review</h3>
                  <ReviewForm propertyId={property._id} />
                </div>
              </div>

            </div>

            {/* Right Sticky Booking Sidebar */}
            <aside className="lg:col-span-4 w-full">
              <div className="lg:sticky lg:top-28 space-y-5">
                <div className="rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.06)] space-y-5">
                  
                  {/* Price Banner */}
                  <div className="flex items-baseline justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        ₹{property.price}
                      </span>
                      <span className="text-xs font-bold text-slate-400 ml-1">/ month</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Best Price
                    </span>
                  </div>

                  {/* Location Snapshot */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Address</span>
                    <p className="font-semibold text-slate-700 leading-snug">
                      {[property.address, property.area, property.city].filter(Boolean).join(', ') || property.location}
                    </p>
                  </div>

                  {/* Contact Number Callout */}
                  {property.contactNumber && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">Contact Host Direct</span>
                      <p className="font-black text-sm text-blue-900">{property.contactNumber}</p>
                    </div>
                  )}

                  {/* Cost Summary Breakdown */}
                  <div className="space-y-2 text-xs text-slate-600 pt-1">
                    <div className="flex justify-between font-medium">
                      <span>Monthly Rent</span>
                      <span className="font-bold text-slate-900">₹{property.price}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Electricity</span>
                      <span className="font-bold text-slate-900">{property.electricityBill}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Maintenance</span>
                      <span className="font-bold text-slate-900">{property.maintenance}</span>
                    </div>
                    <hr className="border-slate-100 my-2" />
                    <div className="flex justify-between text-sm font-black text-slate-900">
                      <span>Total Monthly</span>
                      <span className="text-blue-600">₹{property.price}</span>
                    </div>
                  </div>

                  {/* Request Booking Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => router.push(`/requests?propertyId=${property._id}`)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Request Visit / Booking</span>
                    </button>
                  </div>

                  <p className="text-center text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1.5 pt-1">
                    <span className="text-emerald-500">✓</span> Free to schedule • No advance payment
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* Similar Recommended Stays */}
          {similarProperties.length > 0 && (
            <section className="mt-20 pt-12 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Recommended Similar Stays
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Explore other options you might like</p>
                </div>
                <Link 
                  href="/search" 
                  className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-xl transition-all"
                >
                  View all stays →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProperties.map(p => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      {/* Mobile Bottom Fixed Booking Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 p-3 px-4 md:hidden flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div>
          <span className="text-lg font-black text-slate-900">₹{property.price}</span>
          <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">/ month</span>
        </div>
        <button
          onClick={() => router.push(`/requests?propertyId=${property._id}`)}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span>Request Visit</span>
          <span>→</span>
        </button>
      </div>

      {/* Lightbox Modal for 3 Full-Size Images */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm font-bold z-10"
          >
            ✕ Close
          </button>

          <div className="relative max-w-4xl w-full max-h-[85vh] flex flex-col items-center">
            <img 
              src={images[activeImageIndex]} 
              alt={`Full view ${activeImageIndex + 1}`}
              className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl" 
            />

            {/* Lightbox Navigation Controls */}
            <div className="flex items-center justify-between w-full max-w-md mt-4 text-white">
              <button 
                onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all"
              >
                ← Previous
              </button>
              <span className="text-xs font-bold text-white/70">
                Photo {activeImageIndex + 1} of {images.length}
              </span>
              <button 
                onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all"
              >
                Next →
              </button>
            </div>

            {/* Thumbnail selector */}
            <div className="flex gap-2 mt-3">
              {images.slice(0, 3).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-12 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-blue-500 scale-105' : 'border-transparent opacity-50'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
