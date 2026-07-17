'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchProperties } from '@/services/property.service';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types/property';

export default function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCity, setPendingCity] = useState('');
  const [pendingType, setPendingType] = useState('All');
  const [pendingRating, setPendingRating] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadInitialData = async () => {
      try {
        const cityData = await (await import('@/services/property.service')).fetchCities();
        const preferredOrder = [
          'Nagpur', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad',
          'Nashik', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Indore', 'Bhopal', 'Jaipur', 'Lucknow', 'Kanpur',
          'Surat', 'Vadodara', 'Rajkot', 'Coimbatore', 'Kochi', 'Visakhapatnam', 'Vijayawada', 'Mysuru',
          'Chandigarh', 'Bhubaneswar', 'Patna', 'Guwahati'
        ];
        const sortedCities = [...cityData].sort((a, b) => {
          const indexA = preferredOrder.indexOf(a);
          const indexB = preferredOrder.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        });
        setCities(sortedCities);
        await handleFetch();
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };
    loadInitialData();
  }, []);

  const handleFetch = async (city = pendingCity, type = pendingType, rating = pendingRating) => {
    setLoading(true);
    try {
      const data = await fetchProperties({ 
        city, 
        type,
        minRating: rating > 0 ? rating : undefined
      });
      setProperties(data);
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    handleFetch();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-10 rounded-[40px] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl transition-all hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-zinc-50">Filters</h2>
                <button 
                  onClick={() => {
                    setPendingCity('');
                    setPendingType('All');
                    setPendingRating(0);
                    handleFetch('', 'All', 0);
                  }}
                  className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                >
                  Reset
                </button>
              </div>
              
              {/* Type Filter */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Property Type</h3>
                <div className="space-y-3">
                  {['All', 'PG', 'Flat', 'Homestay', 'Hostel', 'Room'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="radio" 
                          name="propertyType"
                          checked={pendingType === type}
                          onChange={() => setPendingType(type)}
                          className="peer h-5 w-5 rounded-full border-zinc-800 bg-zinc-900 text-primary focus:ring-primary/20 transition-all" 
                        />
                      </div>
                      <span className={`text-sm font-medium transition-colors ${pendingType === type ? 'text-primary' : 'text-zinc-400 group-hover:text-zinc-50'}`}>
                        {type === 'Room' ? 'Room (Business)' : type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Budget Range</h3>
                <div className="px-2">
                  <input type="range" className="w-full accent-primary" />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-600 uppercase">
                    <span>₹2,000</span>
                    <span>₹20,000+</span>
                  </div>
                </div>
              </div>

              {/* City Filter */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Select City</h3>
                <select 
                  value={pendingCity}
                  onChange={(e) => setPendingCity(e.target.value)}
                  className="w-full rounded-2xl border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Min Rating</h3>
                <div className="flex gap-2">
                  {[4, 3, 2].map(r => (
                    <button 
                      key={r} 
                      onClick={() => setPendingRating(pendingRating === r ? 0 : r)}
                      className={`flex-1 py-2 rounded-xl border transition-all text-xs font-bold ${
                        pendingRating === r 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {r}+ ⭐
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={applyFilters}
                className="w-full py-4 rounded-[24px] bg-primary text-white text-sm font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  Find Stays
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                  {mounted ? properties.length : '...'} verified listings found
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sort by</span>
                <select className="rounded-2xl border-none bg-white px-6 py-3 text-sm font-bold shadow-md outline-none dark:bg-zinc-900 dark:text-white">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Top Rated</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                [1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-[4/5] rounded-[40px] bg-zinc-200 animate-pulse dark:bg-zinc-800" />
                ))
              ) : (
                properties.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
