'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
            Data Privacy
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
            Swigo respects your privacy and is committed to protecting your personal information.
          </p>
        </div>

        <div className="space-y-8 text-slate-300">
          {/* Information We Collect */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋</span> Information We Collect
            </h2>
            <p className="font-medium text-slate-400">We may collect:</p>
            <ul className="list-disc list-inside space-y-2 font-medium text-slate-300 pl-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Profile information</li>
              <li>Booking information</li>
              <li>Payment-related information (if applicable)</li>
              <li>Device and usage information</li>
            </ul>
          </section>

          {/* How We Use Information */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>⚙️</span> How We Use Information
            </h2>
            <p className="font-medium text-slate-400">Your information may be used to:</p>
            <ul className="list-disc list-inside space-y-2 font-medium text-slate-300 pl-2">
              <li>Create and manage your account.</li>
              <li>Process bookings.</li>
              <li>Improve our services.</li>
              <li>Provide customer support.</li>
              <li>Detect fraud and enhance platform security.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🤝</span> Information Sharing
            </h2>
            <p className="font-medium leading-relaxed text-slate-400">
              We may share necessary information with property owners, tiffin providers, service partners, or legal authorities when required by law or to provide the requested services.
            </p>
          </section>

          {/* Data Security */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🔐</span> Data Security
            </h2>
            <p className="font-medium leading-relaxed text-slate-400">
              We use reasonable administrative, technical, and organizational measures to protect your information. However, no internet-based service can guarantee absolute security.
            </p>
          </section>

          {/* User Rights */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🛡️</span> User Rights
            </h2>
            <p className="font-medium leading-relaxed text-slate-400">
              Depending on applicable law, you may have rights to access, update, correct, or request deletion of your personal information.
            </p>
          </section>

          {/* Contact */}
          <section className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✉️</span> Contact
            </h2>
            <p className="font-medium leading-relaxed text-slate-400">
              If you have questions regarding this Privacy Policy, please contact our support team.
            </p>
            <div className="pt-2">
              <Link href="/help" className="text-sm font-bold text-primary hover:underline">
                Visit Help Center →
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
