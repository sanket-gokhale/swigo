'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TiffinCard from '@/components/food/TiffinCard';

import { getJSON } from '@/services/api';

export default function FoodSearchPage() {
  const [tiffins, setTiffins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');

  useEffect(() => {
    fetchTiffins();
  }, []);

  const fetchTiffins = async (city = '') => {
    setLoading(true);
    try {
      const data = await getJSON(`/tiffins?city=${city}&type=independent`);
      setTiffins(data.data || data || []);
    } catch (err) {
      console.error('Failed to fetch tiffins');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTiffins(searchCity);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Search Section */}
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 px-4 bg-slate-900 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tight">
              Home Food, <span className="text-primary">Everywhere.</span>
            </h1>
            <p className="text-base md:text-xl text-slate-400 font-medium max-w-2xl mx-auto">
              Find local tiffin providers delivering healthy, home-cooked meals to your doorstep.
            </p>
            
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 md:gap-4 p-2 bg-white/10 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl">
              <div className="flex-1 flex items-center px-4 md:px-6 gap-2 md:gap-4">
                <span className="text-xl md:text-2xl">📍</span>
                <input 
                  type="text" 
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Enter your city (e.g. Noida, Delhi)"
                  className="w-full bg-transparent border-none text-white placeholder-slate-500 focus:ring-0 py-3 md:py-5 font-bold text-sm md:text-base"
                />
              </div>
              <button 
                type="submit"
                className="w-full md:w-auto px-6 py-3.5 md:px-10 md:py-5 bg-primary text-white rounded-xl md:rounded-[2rem] font-black text-base md:text-lg hover:bg-white hover:text-primary transition-all active:scale-95"
              >
                Find Food
              </button>
            </form>
          </div>
        </section>

        {/* Results Section */}
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Popular Tiffin Services</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Based on ratings and nearby delivery area</p>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4">
               {['Veg', 'Non-Veg', 'Monthly', 'Daily'].map(filter => (
                 <button key={filter} className="px-4 py-2 md:px-6 md:py-2.5 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600 hover:border-primary hover:text-primary transition-all">
                   {filter}
                 </button>
               ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[350px] md:h-[400px] bg-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
              {tiffins.map(tiffin => (
                <TiffinCard key={tiffin._id} tiffin={tiffin} />
              ))}
              {tiffins.length === 0 && (
                <div className="col-span-full py-12 md:py-20 text-center">
                   <p className="text-3xl md:text-4xl">🥘</p>
                   <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-4">No tiffin services found</h3>
                   <p className="text-sm text-slate-500 mt-2">Try searching for a different city or area.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
