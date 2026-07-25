'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function SafetyPage() {
  const recommendations = [
    'Verify property details before making a booking.',
    'Visit the property whenever possible.',
    'Never transfer money outside official payment methods supported by the platform.',
    'Keep conversations respectful and professional.',
    'Report suspicious listings or fraudulent behavior immediately.',
    'Do not share sensitive personal or banking information with unknown individuals.'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-4 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            🛡️ Trust & Safety
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Safety & Integrity
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Your safety is important to us. Swigo provides a platform that connects users with verified property owners and tiffin providers. While we take reasonable steps to verify listings and maintain platform integrity, users should also exercise their own judgment.
          </p>
        </div>

        {/* Safety Recommendations */}
        <section className="mb-12 p-8 md:p-10 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-3">
            <span>✅</span> Safety Recommendations
          </h2>
          <ul className="grid gap-4">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-xs">
                  {i + 1}
                </span>
                <span className="text-slate-300 font-medium leading-relaxed">
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Reporting Abuse */}
        <section className="p-8 md:p-10 rounded-3xl border border-rose-500/20 bg-rose-950/10 space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>🚨</span> Reporting Abuse
          </h2>
          <p className="text-slate-300 font-medium leading-relaxed">
            If you believe a listing is fraudulent or violates our policies, please report it immediately through the platform or contact support.
          </p>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">
            Swigo may investigate reports and suspend or remove accounts that violate our policies.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
