'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export default function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I create an account?',
      a: 'Select Sign Up, enter your details, verify your email or phone number, and complete your profile.'
    },
    {
      q: 'How do I book a property?',
      a: 'Browse available listings, review property details, select your preferred room, and submit a booking request.'
    },
    {
      q: 'Can I cancel my booking?',
      a: 'Cancellation policies vary by property owner. Please review the property\'s cancellation policy before booking.'
    },
    {
      q: 'How do I contact a property owner?',
      a: 'Use the contact options available on the property listing after logging into your account.'
    },
    {
      q: 'How do I report incorrect information?',
      a: 'Use the Report Listing option or contact our support team through the Help Center.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            Support & Resources
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Swigo <span className="text-primary">Help Center</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Welcome to the Swigo Help Center. Our goal is to provide a safe and reliable platform for booking PGs, rooms, flats, homestays, and tiffin services.
          </p>
        </div>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-slate-800 pb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all duration-300 hover:border-slate-700"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-base md:text-lg text-white hover:text-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-primary font-black text-xl ml-4">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-slate-400 font-medium leading-relaxed border-t border-slate-800/50 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Dashboard Support Cards */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4 hover:border-slate-700 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
              🏠
            </div>
            <h3 className="text-xl font-bold text-white">Owner Support</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Property owners can manage listings, bookings, availability, pricing, and profile information from the Owner Dashboard.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4 hover:border-slate-700 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-2xl">
              🍱
            </div>
            <h3 className="text-xl font-bold text-white">Tiffin Provider Support</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Tiffin providers can manage menus, service areas, pricing, and customer orders from the Tiffin Dashboard.
            </p>
          </div>
        </section>

        {/* Need More Help */}
        <section className="p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Need More Help?</h3>
          <p className="text-slate-400 max-w-xl mx-auto font-medium">
            If you cannot find the answer you&apos;re looking for, please contact our support team through the Contact Us page.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/requests"
              className="inline-flex items-center px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Contact Support - 8999307382
            </Link>
            <a
              href="mailto:swigo.official@gmail.com"
              className="inline-flex items-center px-8 py-3.5 rounded-full bg-slate-800 text-white font-bold text-sm hover:bg-slate-700 transition-all border border-slate-700 shadow-lg"
            >
              Email - swigo.official@gmail.com
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
