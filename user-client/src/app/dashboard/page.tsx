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

  useEffect(() => {
    setMounted(true);
    const checkUser = () => {
      const u = getUser();
      if (!u) {
        router.push('/login');
      } else {
        setUser(u);
      }
    };
    checkUser();
  }, [router]);

  const loadData = async (lat?: number, lng?: number) => {
    try {
      const allProps = await fetchProperties();
      setProperties(allProps);

      if (lat && lng) {
        const nearby = await fetchProperties({ lat, lng, distance: 10000 });
        setNearbyProperties(nearby);

        // Fetch nearby tiffins
        const tiffinData = await getJSON(`/tiffins?lat=${lat}&lng=${lng}&distance=10000`);
        setNearbyTiffins(tiffinData.data || tiffinData || []);
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
    { name: 'Girls PG', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/></svg> },
    { name: 'Boys PG', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg> },
    { name: 'Mixed', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { name: 'Flats', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V3.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5V21"/></svg> },
    { name: 'Tiffins', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M12 12v6"/><path d="M8 12v3"/><path d="M16 12v3"/></svg> },
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
                Your search for a <br/>
                <span className="text-primary">perfect stay</span> ends here.
              </h1>
              <p className="text-lg font-medium text-slate-500 mb-12 max-w-xl">
                Discover the most comfortable PGs, flats, and home-style tiffin services in your city. Verified listings, secure bookings.
              </p>
              
              {/* Search Bar - Clean & Smooth */}
              <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-100 flex flex-col md:flex-row gap-2 border border-slate-200">
                <div className="flex-1 flex items-center gap-4 px-6 py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input 
                    type="text" 
                    placeholder="Search by area or locality" 
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
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
                
                <button className="btn-primary px-10">
                  Search
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-[1400px] mx-auto px-6 -translate-y-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <Link 
                key={cat.name} 
                href={`/search?type=${cat.name}`}
                className="card-modern p-8 flex flex-col items-center gap-4 group text-center"
              >
                <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner">
                  {cat.icon}
                </div>
                <span className="text-sm font-black text-white group-hover:text-primary transition-colors tracking-tight">{cat.name}</span>
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {nearbyProperties.slice(0, 3).map(property => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            </section>
          )}

          {nearbyTiffins.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Fresh Food
                  </span>
                  <h2 className="text-3xl font-bold text-slate-800">Nearby Tiffin Services</h2>
                </div>
                <Link href="/food" className="text-sm font-bold text-primary hover:underline">View menu</Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {nearbyTiffins.slice(0, 3).map(tiffin => (
                  <div key={tiffin._id} className="card-modern overflow-hidden group">
                    <div className="aspect-[1.5/1] relative overflow-hidden">
                      <img src={tiffin.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={tiffin.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute top-4 right-4 px-4 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-black text-slate-900 shadow-xl">
                        ₹{tiffin.price}/meal
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{tiffin.name}</h3>
                      <p className="text-sm text-zinc-400 line-clamp-2">{tiffin.description}</p>
                    </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="aspect-[1.5/1] rounded-[2rem] bg-slate-50 animate-pulse" />)
              ) : (
                properties.slice(0, 3).map(property => (
                  <PropertyCard key={property._id} property={property} />
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="aspect-[1.5/1] rounded-[2rem] bg-slate-50 animate-pulse" />)
              ) : (
                properties.slice(3, 6).map(property => (
                  <PropertyCard key={property._id} property={property} />
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
