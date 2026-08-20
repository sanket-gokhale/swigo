'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import { fetchProperties } from '@/services/property.service';
import { Property } from '@/types/property';
import { useLocation } from '@/context/LocationContext';
import { getUser, logout } from '@/services/auth.service';
import { getJSON } from '@/services/api';

const MobileListingCard = ({ item }: { item: any }) => {
  const isTiffin = item.type === 'Tiffin';
  const data = item.data;
  
  const badgeColors: Record<string, string> = {
    Hostel: 'bg-[#2563eb]',
    PG: 'bg-[#22a447]',
    Tiffin: 'bg-[#f97316]'
  };
  const badgeColor = badgeColors[item.type] || badgeColors.Hostel;
  
  const title = data.title || data.name || 'Listing';
  const image = data.images?.[0] || (isTiffin ? '/tifin.jpeg' : '/hostel.jpeg');
  const location = data.location || data.area || 'Nagpur';
  const rating = data.averageRating || '4.5';
  const link = isTiffin ? `/food/${data._id}` : `/property/${data._id}`;

  return (
    <Link href={link} className="block w-full group">
      <div className="rounded-[16px] border border-slate-100/60 bg-white/80 backdrop-blur-md overflow-hidden shadow-[0_4px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full group-hover:-translate-y-1">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm backdrop-blur-md bg-opacity-90 ${badgeColor}`}>
            {item.type}
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-[#07183d] truncate">{title}</h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-[11px] font-medium truncate max-w-[60px]">{location}</span>
            </div>
            <div className="flex items-center gap-1 text-[#07183d]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[11px] font-bold">{rating}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100/60 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-medium">Starts at</span>
            <span className="text-sm font-bold text-blue-600">₹{data.price || data.rent || data.startingPrice || 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { location, loading: locLoading, requestLocation, setManualLocation } = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [nearbyTiffins, setNearbyTiffins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?search=${encodeURIComponent(q)}`);
    } else {
      router.push('/search');
    }
  };

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  const loadData = async (lat?: number, lng?: number) => {
    try {
      const allPropsPromise = fetchProperties();
      let nearbyPropsPromise = Promise.resolve([]);
      let tiffinDataPromise;

      if (lat && lng) {
        nearbyPropsPromise = fetchProperties({ lat, lng, distance: 10000 });
        tiffinDataPromise = getJSON(`/tiffins?lat=${lat}&lng=${lng}&distance=10000`);
      } else {
        tiffinDataPromise = getJSON('/tiffins');
      }

      const [allProps, nearby, tiffinData] = await Promise.all([
        allPropsPromise,
        nearbyPropsPromise,
        tiffinDataPromise
      ]);

      setProperties(allProps);
      if (lat && lng) {
        setNearbyProperties(nearby);
      }

      const list = Array.isArray(tiffinData?.data) ? tiffinData.data : (Array.isArray(tiffinData) ? tiffinData : []);
      if (list.length === 0 && lat && lng) {
        const fallback = await getJSON('/tiffins');
        const fallbackList = Array.isArray(fallback?.data) ? fallback.data : (Array.isArray(fallback) ? fallback : []);
        setNearbyTiffins(fallbackList);
      } else {
        setNearbyTiffins(list);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(location?.latitude, location?.longitude);
  }, [location]);

  const categories = [
    { name: 'Girls PG', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" /></svg>, color: 'text-pink-600', bg: 'bg-pink-100' },
    { name: 'Boys PG', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Hostel', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Flats', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M9 8h1" /><path d="M9 12h1" /><path d="M9 16h1" /><path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" /><path d="M5 21V3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5V21" /></svg>, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Tiffins', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" /><path d="M12 12v6" /><path d="M8 12v3" /><path d="M16 12v3" /></svg>, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const popularCities = [
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
    { name: 'Aurangabad (Chhatrapati Sambhajinagar)', lat: 19.8762, lng: 75.3433 },
    { name: 'Indore', lat: 22.7196, lng: 75.8577 },
    { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
    { name: 'Surat', lat: 21.1702, lng: 72.8311 },
    { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
    { name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
    { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
    { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
    { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
    { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
    { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
    { name: 'Patna', lat: 25.5941, lng: 85.1376 },
    { name: 'Guwahati', lat: 26.1158, lng: 91.7086 }
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-20 pb-32">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-slate-50 pt-16 pb-16 md:pt-20 md:pb-20 lg:min-h-[720px] lg:pt-24 lg:pb-24">

          {/* Background Gradient Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-white" />
          
          {/* Background shape */}
          <div className="absolute right-0 top-0 h-full w-full lg:w-[65%] bg-gradient-to-bl from-blue-600/[0.04] to-transparent rounded-bl-[180px] lg:rounded-bl-[220px]" />

          {/* Decorative dots */}
          <div className="absolute right-8 top-8 hidden lg:grid grid-cols-6 gap-3 opacity-40">
            {Array.from({ length: 36 }).map((_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white"
              />
            ))}
          </div>

          <div className="relative z-10 mx-auto max-w-[1450px] px-5 sm:px-8 lg:px-10">

            <div className="grid grid-cols-1 items-center justify-between gap-14 lg:flex-nowrap lg:grid-cols-[43%_57%] lg:gap-8">

              {/* ================= LEFT ================= */}
              <div className="w-full">

                {/* Main heading */}
                <h1 className="mt-2 text-5xl font-extrabold leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-[72px] xl:text-[82px]">
                  Your Stay.
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Simplified.
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-[#17233d] sm:text-lg lg:text-xl">
                  Find the perfect Hostel, PG and Tiffin services –
                  <span className="font-semibold text-[#2563eb]">
                    {" "}All in one place.
                  </span>
                </p>

                {/* Mobile Hero Image (hidden on lg) - Removed for small devices */}

                {/* Feature items */}
                <div className="mt-8 hidden lg:flex items-center justify-between gap-x-2 sm:gap-x-4 lg:gap-x-6">

                  {/* Hostel */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-lg shadow-blue-500/30 sm:h-14 sm:w-14">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                      >
                        <path d="M2 4v16" />
                        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                        <path d="M2 17h20" />
                        <path d="M6 8v9" />
                      </svg>
                    </div>

                    <div className="whitespace-nowrap">
                      <h4 className="text-sm font-extrabold text-[#07183d] sm:text-base">
                        Hostels
                      </h4>
                      <p className="text-[10px] font-medium text-slate-500 sm:text-xs mt-0.5">
                        Comfortable stays
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden h-10 w-px bg-slate-300 sm:block" />

                  {/* PG */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22a447] text-white shadow-lg shadow-green-500/30 sm:h-14 sm:w-14">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                      >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>

                    <div className="whitespace-nowrap">
                      <h4 className="text-sm font-extrabold text-[#07183d] sm:text-base">
                        PG
                      </h4>
                      <p className="text-[10px] font-medium text-slate-500 sm:text-xs mt-0.5">
                        Safe & Affordable
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden h-10 w-px bg-slate-300 sm:block" />

                  {/* Tiffin */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f97316] text-white shadow-lg shadow-orange-500/30 sm:h-14 sm:w-14">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                      >
                        <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z" />
                        <path d="M2 14h20" />
                        <path d="M12 3v-1" />
                      </svg>
                    </div>

                    <div className="whitespace-nowrap">
                      <h4 className="text-sm font-extrabold text-[#07183d] sm:text-base">
                        Tiffin Services
                      </h4>
                      <p className="text-[10px] font-medium text-slate-500 sm:text-xs mt-0.5">
                        Homely & Delicious
                      </p>
                    </div>
                  </div>

                </div>

                {/* Search */}
                <div className="relative mt-5 lg:mt-12 w-full max-w-2xl rounded-[22px] lg:rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)] transition-shadow duration-300 md:h-[72px]">

                  {/* Search label */}
                  <div className="absolute -top-4 left-4 hidden lg:flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-[10px] font-extrabold tracking-wide text-[#07183d] sm:text-xs">
                      Search. Compare. Book.
                      <span className="text-[#2563eb]">{" "}Live Better.</span>
                    </span>
                  </div>

                  <div className="flex h-full flex-col md:flex-row md:items-center">

                    {/* Search input */}
                    <div className="flex flex-1 items-center gap-3 px-3 py-2 md:py-0 lg:px-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#2563eb]">
                        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearch();
                        }}
                        placeholder="Search by area, locality..."
                        className="w-full min-w-0 bg-transparent text-sm font-semibold text-[#07183d] outline-none placeholder:text-slate-400 sm:text-base"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 mt-1 md:border-t-0 md:pt-0 md:mt-0 md:border-l md:border-slate-200">
                      {/* Location */}
                      <div className="relative flex-1 md:flex-none">
                        <button
                          onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                          type="button"
                          className="flex w-full items-center justify-between gap-1 px-2 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-[#2563eb] md:w-auto md:gap-2 md:px-4"
                        >
                          <div className="flex min-w-0 items-center gap-1 md:gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-slate-400 hidden sm:block">
                              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {location?.address ? (
                              <span className="max-w-[140px] truncate text-[#2563eb]">
                                {location.address.split(",")[0]}
                              </span>
                            ) : (
                              <span>Location</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">▼</span>
                        </button>

                        {showLocationDropdown && (
                          <div className="absolute left-0 md:left-auto md:right-0 top-full z-50 mt-2 w-full min-w-[200px] rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl md:w-56">
                            <button
                              onClick={() => {
                                requestLocation();
                                setShowLocationDropdown(false);
                              }}
                              className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                              📍 GPS / Current Location
                            </button>
                            <div className="my-1 h-px bg-slate-100" />
                            <div className="max-h-[250px] overflow-y-auto">
                              {popularCities.map((city) => (
                                <button
                                  key={city.name}
                                  onClick={() => {
                                    setManualLocation(city.name, city.lat, city.lng);
                                    setShowLocationDropdown(false);
                                  }}
                                  className="w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  🌇 {city.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Search button */}
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="ml-2 flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 md:ml-0 md:h-full md:w-auto md:rounded-xl md:px-8"
                      >
                        <span className="hidden md:inline">Search</span>
                        <svg className="h-4 w-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
                        </svg>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Mobile Service Cards (lg:hidden) */}
                <div className="mt-5 grid grid-cols-3 gap-3 lg:hidden">
                  {/* Hostel Card */}
                  <div className="aspect-[4/5] rounded-[20px] border border-slate-100/60 bg-white/70 backdrop-blur-md p-2 text-center shadow-[0_8px_20px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center hover:-translate-y-1 transition-transform">
                    <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M2 4v16" />
                        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                        <path d="M2 17h20" />
                        <path d="M6 8v9" />
                      </svg>
                    </div>
                    <h4 className="text-xs font-bold text-[#07183d]">Hostels</h4>
                    <p className="text-[10px] font-medium text-slate-500 mt-1 leading-[1.3]">Comfortable<br/>stays</p>
                    <div className="mt-2 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* PG Card */}
                  <div className="aspect-[4/5] rounded-[20px] border border-slate-100/60 bg-white/70 backdrop-blur-md p-2 text-center shadow-[0_8px_20px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center hover:-translate-y-1 transition-transform">
                    <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <h4 className="text-xs font-bold text-[#07183d]">PG</h4>
                    <p className="text-[10px] font-medium text-slate-500 mt-1 leading-[1.3]">Safe &<br/>Affordable</p>
                    <div className="mt-2 text-green-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Tiffin Card */}
                  <div className="aspect-[4/5] rounded-[20px] border border-slate-100/60 bg-white/70 backdrop-blur-md p-2 text-center shadow-[0_8px_20px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center hover:-translate-y-1 transition-transform">
                    <div className="mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z" />
                        <path d="M2 14h20" />
                        <path d="M12 3v-1" />
                      </svg>
                    </div>
                    <h4 className="text-xs font-bold text-[#07183d]">Tiffins</h4>
                    <p className="text-[10px] font-medium text-slate-500 mt-1 leading-[1.3]">Homely &<br/>Delicious</p>
                    <div className="mt-2 text-orange-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Mobile Trust Section (lg:hidden) */}
                <div className="mt-5 lg:hidden rounded-[20px] bg-white/50 backdrop-blur-md py-5 px-2 flex justify-between items-start shadow-sm border border-slate-100/60">
                  {/* Verified Listings */}
                  <div className="flex flex-col items-center flex-1 text-center px-1">
                    <div className="mb-2 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-bold text-[#07183d] leading-[1.2]">Verified<br/>Listings</p>
                  </div>
                  
                  {/* Divider */}
                  <div className="w-px h-10 bg-slate-200 mt-1"></div>
                  
                  {/* Affordable Options */}
                  <div className="flex flex-col items-center flex-1 text-center px-1">
                    <div className="mb-2 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                        <path d="M12 18V6" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-bold text-[#07183d] leading-[1.2]">Affordable<br/>Options</p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-10 bg-slate-200 mt-1"></div>

                  {/* Quality You Can Trust */}
                  <div className="flex flex-col items-center flex-1 text-center px-1">
                    <div className="mb-2 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-bold text-[#07183d] leading-[1.2]">Quality You<br/>Can Trust</p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-10 bg-slate-200 mt-1"></div>

                  {/* Support That Cares */}
                  <div className="flex flex-col items-center flex-1 text-center px-1">
                    <div className="mb-2 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-bold text-[#07183d] leading-[1.2]">Support That<br/>Cares</p>
                  </div>
                </div>

              </div>

              {/* ================= RIGHT CARDS ================= */}
              <div className="relative hidden h-[400px] w-full sm:h-[500px] lg:block lg:h-[570px]">

                {/* Hostel Card */}
                <div className="absolute left-[0%] top-[12%] z-10 w-[150px] rotate-[-5deg] rounded-[25px] border-2 border-white/80 bg-white/60 backdrop-blur-md p-2 shadow-2xl transition-all duration-500 hover:z-50 hover:rotate-0 hover:scale-110 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] sm:left-[3%] sm:w-[210px] lg:left-[0%] lg:w-[280px]">

                  <div className="flex flex-col items-center">

                    <div className="relative z-20 -mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#2563eb] text-white shadow-lg sm:-mt-10 sm:h-16 sm:w-16">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8"
                      >
                        <path d="M2 4v16" />
                        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                        <path d="M2 17h20" />
                        <path d="M6 8v9" />
                      </svg>

                    </div>

                    <h3 className="mt-2 mb-2 text-sm font-extrabold text-[#07183d] sm:text-xl">
                      Hostels
                    </h3>

                    <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100">

                      <img
                        src="/hostel.jpeg"
                        alt="Hostel"
                        className="h-full w-full object-cover"
                      />

                    </div>

                  </div>
                </div>

                {/* PG Card */}
                <div className="absolute left-[30%] top-[3%] z-20 w-[165px] rotate-[2deg] rounded-[25px] border-2 border-white/80 bg-white/60 backdrop-blur-md p-2 shadow-2xl transition-all duration-500 hover:z-50 hover:rotate-0 hover:scale-110 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] sm:left-[32%] sm:w-[230px] lg:left-[32%] lg:w-[310px]">

                  <div className="flex flex-col items-center">

                    <div className="relative z-20 -mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#22a447] text-white shadow-lg sm:-mt-10 sm:h-[68px] sm:w-[68px]">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8"
                      >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>

                    </div>

                    <h3 className="mt-2 mb-2 text-sm font-extrabold text-[#07183d] sm:text-xl">
                      PG
                    </h3>

                    <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100">

                      <img
                        src="/pghero.jpeg"
                        alt="PG"
                        className="h-full w-full object-cover"
                      />

                    </div>

                  </div>
                </div>

                {/* Tiffin Card */}
                <div className="absolute right-[0%] top-[15%] z-30 w-[150px] rotate-[7deg] rounded-[25px] border-2 border-white/80 bg-orange-50/60 backdrop-blur-md p-2 shadow-2xl transition-all duration-500 hover:z-50 hover:rotate-0 hover:scale-110 hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] sm:right-[2%] sm:w-[210px] lg:right-[-2%] lg:w-[280px]">

                  <div className="flex flex-col items-center">

                    <div className="relative z-20 -mt-8 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#f97316] text-white shadow-lg sm:-mt-10 sm:h-16 sm:w-16">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8"
                      >
                        <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z" />
                        <path d="M2 14h20" />
                        <path d="M12 3v-1" />
                      </svg>

                    </div>

                    <h3 className="mt-2 mb-2 whitespace-nowrap text-sm font-extrabold text-[#07183d] sm:text-xl">
                      Tiffin Services
                    </h3>

                    <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100">

                      <img
                        src="/tifin.jpeg"
                        alt="Tiffin Services"
                        className="h-full w-full object-cover"
                      />

                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-[1400px] mx-auto px-4 lg:px-6 -translate-y-12 hidden lg:block relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/search?type=${cat.name}`}
                className="group bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 hover:bg-white transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <span className="text-[15px] font-semibold text-slate-800 whitespace-nowrap tracking-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>


        {/* Property Grid Sections */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 lg:py-12 space-y-16 lg:space-y-24">

          {nearbyProperties.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between mb-5 lg:mb-6">
                <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Popular Near You</h2>
                <Link href="/search" className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group">
                  <span className="group-hover:underline">View all</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </div>

              {/* Mobile 2-column grid */}
              <div className="grid grid-cols-2 gap-3 md:hidden">
                {(() => {
                  const items = [];
                  if (nearbyProperties.length > 0) items.push({ type: 'Hostel', data: nearbyProperties[0] });
                  if (nearbyProperties.length > 1) items.push({ type: 'PG', data: nearbyProperties[1] });
                  if (nearbyTiffins.length > 0) items.push({ type: 'Tiffin', data: nearbyTiffins[0] });
                  if (nearbyProperties.length > 2 && items.length < 4) items.push({ type: 'Hostel', data: nearbyProperties[2] });
                  
                  return items.slice(0, 4).map((item, idx) => (
                    <MobileListingCard key={item.data._id || idx} item={item} />
                  ));
                })()}
              </div>

              {/* Desktop horizontal scroll */}
              <div className="hidden md:flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch">
                {nearbyProperties.slice(0, 3).map(property => (
                  <div key={property._id} className="w-[85vw] sm:w-[320px] md:w-[calc(33.333%-1rem)] snap-start flex-none">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {nearbyTiffins.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-10">
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 text-amber-700 text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-3 backdrop-blur-sm border border-amber-200/50">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Fresh Food
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Nearby Tiffin Services</h2>
                </div>
                <Link href="/food" className="flex items-center text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors group self-start sm:self-auto">
                  <span className="group-hover:underline">View menu</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </div>

              {/* Mobile 2-column grid */}
              <div className="grid grid-cols-2 gap-3 md:hidden">
                {nearbyTiffins.slice(0, 4).map(tiffin => (
                  <MobileListingCard key={tiffin._id} item={{ type: 'Tiffin', data: tiffin }} />
                ))}
              </div>

              {/* Desktop horizontal scroll */}
              <div className="hidden md:flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch">
                {nearbyTiffins.slice(0, 3).map(tiffin => (
                  <div key={tiffin._id} className="w-[85vw] sm:w-[320px] md:w-[calc(33.333%-1rem)] snap-start flex-none">
                    <Link href={`/food/${tiffin._id}`} className="group block h-full">
                      <div className="card-modern overflow-hidden h-full flex flex-col">
                        <div className="relative h-[220px] w-[calc(100%-1rem)] mx-auto mt-2 shrink-0 overflow-hidden rounded-[1.5rem]">
                          <img 
                            src={tiffin.images?.[0] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230f172a"/><circle cx="200" cy="120" r="45" fill="%23ff5a5f"/><text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="14" font-weight="bold">Homely Tiffin Service</text></svg>'} 
                            alt={tiffin.name} 
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-4 left-4 flex gap-2">
                            <div className="bg-primary px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white">
                              Fresh Food
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-2 flex flex-col flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2 gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xl font-extrabold text-white truncate">
                                {tiffin.name}
                              </h3>
                              <p className="text-sm font-medium text-slate-400 mt-1 truncate">
                                {tiffin.address || `${tiffin.area}, ${tiffin.city}`}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs md:text-sm text-zinc-400 line-clamp-2 mt-2">{tiffin.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Starting at</p>
                              <p className="text-2xl font-black text-white">₹{tiffin.price}</p>
                            </div>
                            <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-3 backdrop-blur-sm border border-blue-200/50">Hot Selection</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Featured Properties</h2>
              </div>
              <Link href="/search" className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group">
                <span className="group-hover:underline">Explore all</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>

            {/* Mobile 2-column grid */}
            {!loading && (
              <div className="grid grid-cols-2 gap-3 md:hidden">
                {properties.slice(0, 4).map((property, idx) => (
                  <MobileListingCard key={property._id} item={{ type: idx % 2 === 0 ? 'Hostel' : 'PG', data: property }} />
                ))}
              </div>
            )}

            {/* Desktop horizontal scroll */}
            <div className="hidden md:flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="min-w-[85vw] md:min-w-[calc(33.333%-1rem)] snap-start flex-none aspect-[1.5/1] rounded-[2rem] bg-slate-50 animate-pulse" />)
              ) : (
                properties.slice(0, 3).map(property => (
                  <div key={property._id} className="w-[85vw] sm:w-[320px] md:w-[calc(33.333%-1rem)] snap-start flex-none">
                    <PropertyCard property={property} />
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-[10px] font-bold uppercase tracking-widest mb-3 backdrop-blur-sm border border-indigo-200/50">Top Rated</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Loved by Residents</h2>
              </div>
              <Link href="/search" className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group">
                <span className="group-hover:underline">Explore all</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>

            {/* Mobile 2-column grid */}
            {!loading && (
              <div className="grid grid-cols-2 gap-3 md:hidden">
                {properties.slice(3, 7).map((property, idx) => (
                  <MobileListingCard key={property._id} item={{ type: idx % 2 === 0 ? 'PG' : 'Hostel', data: property }} />
                ))}
              </div>
            )}

            {/* Desktop horizontal scroll */}
            <div className="hidden md:flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="min-w-[85vw] md:min-w-[calc(33.333%-1rem)] snap-start flex-none aspect-[1.5/1] rounded-[2rem] bg-slate-50 animate-pulse" />)
              ) : (
                properties.slice(3, 6).map(property => (
                  <div key={property._id} className="w-[85vw] sm:w-[320px] md:w-[calc(33.333%-1rem)] snap-start flex-none">
                    <PropertyCard property={property} />
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
