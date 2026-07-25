'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            Legal Agreement
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
            By using Swigo, you agree to these Terms of Service. Please read them carefully.
          </p>
        </div>

        <div className="space-y-8 text-slate-300">
          {/* Platform Role */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📌</span> Platform Role
            </h2>
            <p className="font-medium leading-relaxed text-slate-400">
              Swigo is an online marketplace that enables users to discover and book accommodations and related services offered by independent property owners and service providers.
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>👤</span> User Responsibilities
            </h2>
            <p className="font-medium text-slate-400">Users agree to:</p>
            <ul className="list-disc list-inside space-y-2 font-medium text-slate-300 pl-2">
              <li>Provide accurate information.</li>
              <li>Use the platform lawfully.</li>
              <li>Respect property owners and service providers.</li>
              <li>Avoid fraudulent or abusive activities.</li>
            </ul>
          </section>

          {/* Property Owners */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏠</span> Property Owners
            </h2>
            <p className="font-medium text-slate-400">Owners are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 font-medium text-slate-300 pl-2">
              <li>Maintaining accurate listings.</li>
              <li>Providing truthful descriptions and pricing.</li>
              <li>Honoring confirmed bookings unless otherwise permitted.</li>
            </ul>
          </section>

          {/* Tiffin Providers */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🍱</span> Tiffin Providers
            </h2>
            <p className="font-medium text-slate-400">Providers are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 font-medium text-slate-300 pl-2">
              <li>Maintaining accurate menus and pricing.</li>
              <li>Preparing and delivering food according to applicable laws and standards.</li>
              <li>Handling customer service related to their orders.</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⚖️</span> Limitation of Liability
            </h2>
            <p className="font-medium leading-relaxed text-slate-400">
              Swigo provides the platform used to connect users with independent property owners and service providers. Unless required by applicable law, Swigo is not a party to rental agreements or food service contracts and is not responsible for the quality, safety, legality, condition, availability, or performance of properties or services offered by third parties.
            </p>
          </section>

          {/* Account Suspension */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🔒</span> Account Suspension
            </h2>
            <p className="font-medium leading-relaxed text-slate-400">
              Swigo may suspend or terminate accounts that violate these Terms or applicable laws.
            </p>
          </section>

          {/* Changes */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📝</span> Changes
            </h2>
            <p className="font-medium leading-relaxed text-slate-400">
              These Terms may be updated periodically. Continued use of the platform constitutes acceptance of the updated Terms.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
