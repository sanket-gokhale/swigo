'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { fetchProperties } from '@/services/property.service';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types/property';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUser } from '@/services/auth.service';

export default function SavedPage() {
  const router = useRouter();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const localUser = getUser();
      if (!localUser) {
        router.push('/login?redirect=/saved');
        return;
      }
      try {
        const data = await fetchProperties();
        // Mocking saved properties by taking the first 2
        setSavedProperties(data.slice(0, 2));
      } catch (err) {
        console.error('Failed to load saved properties', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Saved Stays
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Your favorite properties in one place.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[4/3] rounded-[32px] bg-zinc-200 animate-pulse dark:bg-zinc-800" />)}
          </div>
        ) : savedProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {savedProperties.map(property => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-4xl mb-6">
              ❤️
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">No saved stays yet</h2>
            <p className="text-zinc-500 mt-2 mb-8">Start exploring and save the ones you love!</p>
            <Link href="/search" className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              Browse Properties
            </Link>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
