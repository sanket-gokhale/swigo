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
import BookingButton from '@/components/property/BookingButton';
import { Property } from '@/types/property';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { postAuthJSON } from '@/services/api';
import toast from 'react-hot-toast';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [requestingFood, setRequestingFood] = useState(false);

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
    const loadData = async () => {
      try {
        const [propData, reviewsData, allProps] = await Promise.all([
          fetchPropertyById(id as string).catch(() => null),
          fetchReviews(id as string).catch(() => []),
          fetchProperties().catch(() => [])
        ]);
        setProperty(propData);
        setReviews(reviewsData);
        
        if (propData) {
          // Filter similar properties by type, then location, then others
          const similar = allProps
            .filter(p => p._id !== id)
            .sort((a, b) => {
              if (a.type === propData.type && b.type !== propData.type) return -1;
              if (a.type !== propData.type && b.type === propData.type) return 1;
              return 0;
            })
            .slice(0, 3);
            
          setSimilarProperties(similar);
        }
      } catch (err) {
        console.error('Error loading property detail:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
    </div>
  );

  if (!property) return <div className="text-center py-24 text-slate-500 font-bold text-2xl">Property not found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1">
        {/* Gallery Section - Rounded & Spacious */}
        <section className="max-w-7xl mx-auto px-4 pt-12">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none">
            <div className="md:col-span-2 md:row-span-2 relative">
              <img src={property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'} className="w-full h-full object-cover transition-all duration-700 hover:scale-105" alt="Main" />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-slate-900 px-6 py-2 rounded-full text-xs font-bold shadow-lg">
                ✨ Featured Stay
              </div>
            </div>
            <div className="hidden md:block md:col-span-2 relative">
              <img src={property.images[1] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'} className="w-full h-full object-cover transition-all duration-700 hover:scale-105" alt="Room 1" />
            </div>
            <div className="hidden md:block relative">
              <img src={property.images[2] || 'https://images.unsplash.com/photo-1484154218962-a197022b5858'} className="w-full h-full object-cover transition-all duration-700 hover:scale-105" alt="Room 2" />
            </div>
            <div className="hidden md:block relative group">
              <img src={property.images[3] || property.images[0]} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt="More" />
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-lg cursor-pointer group-hover:bg-slate-900/60 transition-all">
                View All Photos
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-20">
              
              {/* Header Info */}
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-lg font-medium text-slate-500 mt-4">
                      <span>📍</span> {property.location}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSaved(!saved)}
                    className={`h-14 w-14 rounded-2xl border border-slate-200 flex items-center justify-center text-2xl transition-all shadow-sm ${saved ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white hover:bg-slate-50'}`}
                  >
                    {saved ? '❤️' : '🤍'}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Badge icon="🏠" text={property.type} />
                  <Badge icon="👥" text={`${property.genderPreference} Only`} />
                  <Badge icon="🍱" text="Meal Service" />
                  <Badge icon="✨" text="Premium Listing" />
                </div>
              </div>

              <div className="h-1.5 bg-primary/10 w-20 rounded-full" />

              {/* Description */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">About this stay</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {property.description || "Experience premium living in this beautifully designed space. Perfect for students and working professionals looking for a clean, secure, and vibrant environment."}
                </p>
              </div>

              {/* Property Details - Rounded Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-6">
                  <h3 className="text-xl font-bold text-zinc-50 flex items-center gap-2">
                    <span className="text-primary">⚡</span> Logistics
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Electricity</p>
                        <p className="text-sm font-bold text-zinc-100">{property.electricityBill}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                      <span className="text-2xl">🚰</span>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Water Supply</p>
                        <p className="text-sm font-bold text-zinc-100">{property.waterSupplyTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-6">
                  <h3 className="text-xl font-bold text-zinc-50 flex items-center gap-2">
                    <span className="text-primary">💰</span> Cost Details
                  </h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                      <span className="text-2xl">💵</span>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Water Bill</p>
                        <p className="text-sm font-bold text-zinc-100">{property.waterBill}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                      <span className="text-2xl">🛠️</span>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Maintenance</p>
                        <p className="text-sm font-bold text-zinc-100">{property.maintenance}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Included Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(property.amenities && property.amenities.length > 0 ? property.amenities : ['WiFi', 'AC', 'Security', 'Laundry', 'Cleaning']).map(item => (
                    <div key={item} className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
                      <span className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 text-primary text-xl">✨</span>
                      <span className="text-sm font-bold text-zinc-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

               {/* OPTION 1: Food Inside Property */}
              {property.hasFoodService && (
                <div className="p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] bg-zinc-950 border border-zinc-800 space-y-6 md:space-y-8 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 md:gap-5">
                      <div className="h-12 w-12 md:h-14 md:w-14 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl">
                        🏠
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-zinc-50">In-House Food Service</h2>
                        <p className="text-xs md:text-sm font-medium text-primary">Option 1: Food available inside property</p>
                      </div>
                    </div>
                    {property.foodCharges && (
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monthly Charge</p>
                        <p className="text-lg md:text-xl font-bold text-zinc-50">₹{property.foodCharges}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-2 md:pt-4">
                    <div className="space-y-3 md:space-y-4">
                      <h3 className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-wider">Provider Details</h3>
                      <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/5 space-y-2">
                        <p className="text-sm font-bold text-zinc-100">{property.linkedTiffinService?.name || 'Local Kitchen'}</p>
                        <p className="text-xs md:text-sm text-zinc-400">
                          {property.linkedTiffinService?.description || 'Home-style meals prepared with fresh ingredients and hygiene standards.'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      <h3 className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-wider">Today&apos;s Menu</h3>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs md:text-sm text-zinc-300 italic">
                          &quot;{property.linkedTiffinService?.menu?.[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] || 'Special Chef\'s Thali'}&quot;
                        </p>
                      </div>
                      <button 
                        onClick={handleFoodRequest}
                        disabled={requestingFood}
                        className="w-full py-3.5 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
                      >
                        {requestingFood ? 'Sending...' : 'Request This Meal Plan'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* OPTION 2 Placeholder / Suggestion */}
              <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                <div className="flex items-center gap-4">
                   <div className="h-10 w-10 md:h-12 md:w-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl shadow-sm flex-shrink-0">🍱</div>
                   <div>
                     <p className="text-sm font-bold text-slate-900">Looking for more variety?</p>
                     <p className="text-xs text-slate-500">Explore independent tiffin services delivering nearby.</p>
                   </div>
                </div>
                <Link 
                  href="/food" 
                  className="w-full md:w-auto text-center px-6 py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  Explore Tiffins
                </Link>
              </div>

              {/* Reviews Section */}
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Community Reviews</h2>
                  <div className="flex items-center gap-3 bg-zinc-950 px-5 py-2.5 rounded-2xl border border-zinc-800 shadow-xl">
                    <span className="text-2xl font-bold text-amber-500">{property.averageRating?.toFixed(1) || '4.5'}</span>
                    <RatingStars value={property.averageRating} />
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))
                  ) : (
                    <div className="p-20 text-center rounded-[2.5rem] bg-zinc-950/50 border-2 border-dashed border-zinc-800">
                      <p className="text-zinc-500 font-bold">No feedback yet. Be the first to share your experience!</p>
                    </div>
                  )}
                </div>
                
                <div className="pt-8">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Leave a review</h3>
                  <ReviewForm propertyId={property._id} />
                </div>
              </div>
            </div>

            {/* Sidebar - Sticky Booking Card */}
            <aside className="relative">
              <div className="sticky top-28 space-y-8">
                <div className="rounded-[2.5rem] bg-zinc-950 p-10 border border-zinc-800 shadow-2xl">
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-zinc-50 tracking-tight">₹{property.price}</span>
                    <span className="text-sm font-bold text-zinc-500 ml-2">/ month</span>
                  </div>
                  
                  <div className="space-y-5 mb-10">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-zinc-500">Security Deposit</span>
                      <span className="text-zinc-100 font-bold">₹{property.price * 2}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-zinc-500">Electricity</span>
                      <span className="text-zinc-100 font-bold">{property.electricityBill}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-zinc-500">Maintenance</span>
                      <span className="text-zinc-100 font-bold">{property.maintenance}</span>
                    </div>
                    <hr className="border-zinc-800" />
                    <div className="flex justify-between text-xl font-bold text-zinc-50">
                      <span>Initial Total</span>
                      <span className="text-primary">₹{(property.price * 3)}</span>
                    </div>
                  </div>

                  <BookingButton propertyId={property._id} />
                  
                  <p className="mt-6 text-center text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ready for Instant Booking
                  </p>
                </div>

                {/* Host Card */}
                <div className="p-6 rounded-[2rem] bg-zinc-950 border border-zinc-800 shadow-2xl flex items-center gap-5 transition-all hover:border-zinc-700">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-bold text-primary">
                    {property.owner.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Property Owner</p>
                    <p className="text-lg font-bold text-zinc-50">{property.owner.name}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Recommended Stays */}
        <section className="max-w-7xl mx-auto px-4 py-32 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Recommended Stays</h2>
            <Link 
              href="/search" 
              className="px-6 py-2.5 bg-primary/5 text-primary text-sm font-bold rounded-full hover:bg-primary/10 transition-all border border-primary/10"
            >
              Explore more
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties.map(p => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Badge({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="px-5 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] font-bold shadow-sm flex items-center gap-2.5 transition-all hover:border-primary/20 hover:bg-white/5">
      <span className="text-base">{icon}</span> {text}
    </div>
  );
}

