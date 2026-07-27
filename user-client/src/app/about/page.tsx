'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function AboutPage() {
  const offers = [
    { title: 'PG & Room Discovery', desc: 'Find verified single and shared PG rooms with transparent pricing.', icon: '🏠' },
    { title: 'Flats & Homestays', desc: 'Browse furnished flats, apartments, and welcoming homestay listings.', icon: '🏢' },
    { title: 'Online Booking Requests', desc: 'Seamlessly express interest and request room viewings online.', icon: '📅' },
    { title: 'Owner Dashboard', desc: 'Dedicated management tools for property owners to list and manage rooms.', icon: '📊' },
    { title: 'Tiffin Service Marketplace', desc: 'Access fresh home-cooked tiffin services near your stay.', icon: '🍱' },
    { title: 'Secure User Accounts', desc: 'Protected login and profile management with data security.', icon: '🔒' },
    { title: 'Reviews & Ratings', desc: 'Genuine feedback from tenants and food subscribers.', icon: '⭐' },
    { title: 'Real-Time Availability', desc: 'Up-to-date occupancy and room availability tracking.', icon: '⚡' },
  ];

  const values = [
    { title: 'Transparency', desc: 'Clear pricing, genuine property photos, and no hidden fees.', icon: '👁️' },
    { title: 'Trust', desc: 'Verified property listings and authenticated service providers.', icon: '🤝' },
    { title: 'Customer First', desc: 'Dedicated support and user-centric platform features.', icon: '❤️' },
    { title: 'Innovation', desc: 'Modern technology simplifying rental living & food services.', icon: '💡' },
    { title: 'Safety', desc: 'Verified contact details and safe living environment standards.', icon: '🛡️' },
    { title: 'Reliability', desc: 'Consistent service quality and reliable booking management.', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="space-y-6 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            About Swigo
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Simplifying Accommodation &amp; Daily Services
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
            Welcome to Swigo, your trusted platform for finding PGs, rooms, flats, homestays, and tiffin services all in one place.
          </p>
        </div>

        {/* Mission Statement */}
        <section className="mb-16 p-8 sm:p-10 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
            <span>🎯</span> Our Mission
          </h2>
          <p className="text-slate-300 font-medium leading-relaxed text-base sm:text-lg">
            Our mission is to make accommodation and daily living services simple, transparent, and accessible. Whether you're a student, working professional, traveler, or property owner, Swigo provides an easy-to-use platform that connects people with verified listings and trusted service providers.
          </p>
        </section>

        {/* What We Offer Grid */}
        <section className="mb-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white">What We Offer</h2>
            <p className="text-slate-400 text-sm font-medium">Comprehensive solutions for renters, owners, and tiffin kitchens.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition-all group">
                <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{item.icon}</span>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Vision */}
        <section className="mb-16 p-8 sm:p-10 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest">Our Vision</span>
          <h2 className="text-3xl font-black text-white">The Future of Rental Living</h2>
          <p className="text-slate-300 font-medium text-lg max-w-3xl mx-auto leading-relaxed">
            To become India's most trusted accommodation and lifestyle platform by simplifying the search, booking, and management of rental properties and related services.
          </p>
        </section>

        {/* Our Values */}
        <section className="mb-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white">Our Core Values</h2>
            <p className="text-slate-400 text-sm font-medium">The principles that guide everything we build.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val) => (
              <div key={val.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-4">
                <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0">{val.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-white">{val.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mt-1">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Continuous Improvement Statement */}
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-4">
          <p className="text-slate-300 font-medium text-base">
            We are continuously improving our platform to provide the best possible experience for users, property owners, and service providers.
          </p>
          <Link href="/search" className="inline-block px-8 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all text-sm">
            Explore Properties
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
