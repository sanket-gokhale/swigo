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
      const allProps = await fetchProperties();
      setProperties(allProps);

      let tiffinData: any;
      if (lat && lng) {
        const nearby = await fetchProperties({ lat, lng, distance: 10000 });
        setNearbyProperties(nearby);
        tiffinData = await getJSON(`/tiffins?lat=${lat}&lng=${lng}&distance=10000`);
      } else {
        tiffinData = await getJSON('/tiffins');
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
        <section className="relative px-6 py-20 md:py-32 bg-white overflow-hidden border-b border-slate-100">
          {/* Enhanced Green Bubbles */}
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden">
            <svg viewBox="0 0 100 100" className="absolute -right-10 -top-20 w-[600px] h-[600px] text-primary opacity-[0.03]">
              <circle cx="50" cy="50" r="50" fill="currentColor" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute left-1/4 top-1/2 w-[300px] h-[300px] text-primary opacity-[0.02]">
              <circle cx="50" cy="50" r="50" fill="currentColor" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute right-1/3 -bottom-20 w-[400px] h-[400px] text-primary opacity-[0.03]">
              <circle cx="50" cy="50" r="50" fill="currentColor" />
            </svg>
          </div>

          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-800 mb-8">
                Your search for a <br />
                <span className="text-primary">perfect stay</span> ends here.
              </h1>
              <p className="text-lg font-medium text-slate-500 mb-12 max-w-xl">
                Discover the most comfortable PGs, flats, and home-style tiffin services in your city. Verified listings, secure bookings.
              </p>

              {/* Search Bar - Clean & Smooth */}
              <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-100 flex flex-col md:flex-row gap-2 border border-slate-200">
                <div className="flex-1 flex items-center gap-4 px-6 py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                    placeholder="Search by area, locality, or stay name"
                    className="w-full bg-transparent border-none outline-none text-slate-700 font-medium placeholder:text-slate-300"
                  />
                </div>
                <div className="w-px h-10 bg-slate-200 self-center hidden md:block" />

                {/* Location Selection Dropdown */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    type="button"
                    className="flex items-center gap-3 px-6 py-4 text-sm font-bold text-slate-500 hover:text-primary transition-colors w-full md:w-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                    {mounted && location?.address ? (
                      <span className="truncate max-w-[120px] text-primary">{location.address.split(',')[0]}</span>
                    ) : (
                      'Location'
                    )}
                    <span className="text-[10px]">▼</span>
                  </button>

                  {showLocationDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white border border-slate-100 shadow-xl z-50 p-2 text-left">
                      <button
                        onClick={() => {
                          requestLocation();
                          setShowLocationDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        📍 GPS / Current Location
                      </button>
                      <div className="h-px bg-slate-100 my-1" />
                      {popularCities.map((city) => (
                        <button
                          key={city.name}
                          onClick={() => {
                            setManualLocation(city.name, city.lat, city.lng);
                            setShowLocationDropdown(false);
                          }}
                          className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors text-left"
                        >
                          🌇 {city.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button type="button" onClick={handleSearch} className="btn-primary px-10">
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-[1400px] mx-auto px-6 -translate-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/search?type=${cat.name}`}
                className="group bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
        <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-24">

          {nearbyProperties.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Near You
                  </span>
                  <h2 className="text-3xl font-bold text-slate-800">Nearby Stays</h2>
                </div>
                <Link href="/search" className="text-sm font-bold text-primary hover:underline">View map</Link>
              </div>

              <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch">
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
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Fresh Food
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Nearby Tiffin Services</h2>
                </div>
                <Link href="/food" className="text-sm font-bold text-primary hover:underline self-start sm:self-auto">View menu</Link>
              </div>

              <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch">
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
                <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest mb-3">Hot Selection</span>
                <h2 className="text-3xl font-bold text-slate-800">Featured Properties</h2>
              </div>
              <Link href="/search" className="text-sm font-bold text-primary hover:underline">Explore all</Link>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch">
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
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">Top Rated</span>
                <h2 className="text-3xl font-bold text-slate-800">Loved by Residents</h2>
              </div>
              <Link href="/search" className="text-sm font-bold text-primary hover:underline">Explore all</Link>
            </div>

            <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth items-stretch">
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
