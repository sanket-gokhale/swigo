'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchProperties } from '@/services/property.service';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types/property';
import { useSearchParams } from 'next/navigation';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || searchParams.get('query') || searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'All';
  const initialCity = searchParams.get('city') || '';

  const [properties, setProperties] = useState<Property[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSearch, setPendingSearch] = useState(initialQuery);
  const [pendingCity, setPendingCity] = useState(initialCity);
  const [pendingType, setPendingType] = useState(initialType);
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
        const sortedCities = Array.from(new Set(cityData)).sort((a, b) => {
          const indexA = preferredOrder.indexOf(a);
          const indexB = preferredOrder.indexOf(b);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.localeCompare(b);
        });
        setCities(sortedCities);
        await handleFetch(initialCity, initialType, initialQuery);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };
    loadInitialData();
  }, [searchParams]);

  const handleFetch = async (
    city = pendingCity, 
    type = pendingType, 
    search = pendingSearch
  ) => {
    setLoading(true);
    try {
      const data = await fetchProperties({ 
        city, 
        type,
        search: search.trim() || undefined
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
    <main className="flex-1 mx-auto max-w-7xl w-full px-4 pt-28 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        {/* Compact & Attractive Filters Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-28">
          <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </div>
                <h2 className="text-sm font-extrabold text-slate-900">Filters</h2>
              </div>
              <button 
                onClick={() => {
                  setPendingSearch('');
                  setPendingCity('');
                  setPendingType('All');
                  handleFetch('', 'All', '');
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Reset All
              </button>
            </div>
            
            {/* Search Keywords */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Search</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyFilters(); }}
                  placeholder="Area, locality, name..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-7 py-2 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
                </svg>
                {pendingSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingSearch('');
                      handleFetch(pendingCity, pendingType, '');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Type Filter - Compact Chips */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Property Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['All', 'PG', 'Hostel', 'Flat', 'Homestay', 'Room'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setPendingType(type);
                      handleFetch(pendingCity, type, pendingSearch);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                      pendingType === type
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 scale-[1.02]'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">City</label>
              <div className="relative">
                <select 
                  value={pendingCity}
                  onChange={(e) => {
                    setPendingCity(e.target.value);
                    handleFetch(e.target.value, pendingType, pendingSearch);
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-8 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  ▼
                </span>
              </div>
            </div>

            {/* Apply Button */}
            <button 
              onClick={applyFilters}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold tracking-wide shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Apply Filters</span>
            </button>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1 w-full min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Find Stays
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
                {mounted ? (
                  <span>
                    <strong className="text-blue-600 font-bold">{properties.length}</strong> verified stays found
                  </span>
                ) : 'Searching verified stays...'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[4/5] rounded-[24px] bg-slate-100 animate-pulse" />
              ))
            ) : properties.length === 0 ? (
              <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-slate-200 p-8 bg-slate-50/50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">No stays found matching your search criteria.</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting your filters or searching another area.</p>
                <button 
                  onClick={() => {
                    setPendingSearch('');
                    setPendingCity('');
                    setPendingType('All');
                    handleFetch('', 'All', '');
                  }} 
                  className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Suspense fallback={<div className="flex-1 p-12 text-center text-zinc-400 font-bold">Loading search page...</div>}>
        <SearchPageContent />
      </Suspense>
      <Footer />
    </div>
  );
}
