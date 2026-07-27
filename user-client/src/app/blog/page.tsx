'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function BlogPage() {
  const topics = [
    { title: 'PG & Room Rental Tips', icon: '🔑', desc: 'Essential checklists when inspecting new rooms and negotiating rental agreements.' },
    { title: 'Moving & Relocation Guides', icon: '📦', desc: 'Step-by-step moving guides for hassle-free city shifting.' },
    { title: 'Student Accommodation Advice', icon: '🎓', desc: 'Finding budget-friendly PGs near major college hubs and campuses.' },
    { title: 'Budget Living Ideas', icon: '💡', desc: 'Smart ways to save money on daily expenses, meals, and utility bills.' },
    { title: 'City Guides', icon: '🏙️', desc: 'In-depth local area guides for Pune, Mumbai, Bangalore, Delhi, and more.' },
    { title: 'Property Management Insights', icon: '📈', desc: 'Optimizing room occupancy and tenant satisfaction for property owners.' },
    { title: 'Owner Success Stories', icon: '🏆', desc: 'Real experiences from PG owners growing their rental business on Swigo.' },
    { title: 'Tiffin & Meal Recommendations', icon: '🍱', desc: 'Healthy home-cooked meal subscriptions and nutrition tips for students.' },
    { title: 'Product Updates & Features', icon: '🚀', desc: 'New tools, instant booking features, and platform updates on Swigo.' },
    { title: 'Safety & Security Tips', icon: '🛡️', desc: 'Ensuring personal safety, verified listings, and secure payment practices.' },
  ];

  const featuredArticles = [
    {
      title: 'Top 10 Things to Check Before Renting a PG Room in Pune',
      category: 'PG & Rental Tips',
      date: 'July 24, 2026',
      readTime: '4 min read',
      tag: 'Guide',
      desc: 'From water supply schedules to electricity bills and security deposits—here is your ultimate inspection checklist.',
      icon: '🏠'
    },
    {
      title: 'How Daily Tiffin Subscriptions Save Money & Keep You Healthy',
      category: 'Tiffin & Nutrition',
      date: 'July 20, 2026',
      readTime: '3 min read',
      tag: 'Lifestyle',
      desc: 'Comparing restaurant takeout vs verified home-kitchen tiffin services for students and working professionals.',
      icon: '🍱'
    },
    {
      title: 'Property Owner Guide: Maximizing PG Occupancy in 2026',
      category: 'Property Management',
      date: 'July 15, 2026',
      readTime: '5 min read',
      tag: 'Insights',
      desc: 'Best practices for high tenant retention, quick digital listings, and managing partner food services.',
      icon: '📊'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-6 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            Swigo Journal
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Swigo Blog
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Welcome to the Swigo Blog. Stay updated with the latest articles, tips, and news related to accommodation, renting, and student living.
          </p>
        </div>

        {/* Featured Articles Section */}
        <section className="mb-20 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <span>🔥</span> Featured Articles
            </h2>
            <span className="text-xs font-bold text-slate-400">Fresh Content</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <article key={article.title} className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{article.category}</span>
                    <span className="text-slate-500">{article.readTime}</span>
                  </div>
                  <span className="text-4xl block group-hover:scale-110 transition-transform">{article.icon}</span>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">{article.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{article.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{article.date}</span>
                  <span className="text-blue-400 font-bold group-hover:underline">Read Article →</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Topics We Cover Section */}
        <section className="mb-16 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white">Topics We Cover</h2>
            <p className="text-slate-400 text-sm font-medium">Everything you need to know about rental living and daily services.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div key={topic.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700">{topic.icon}</span>
                  <h3 className="text-base font-bold text-white">{topic.title}</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{topic.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Regular Updates Banner */}
        <div className="p-8 sm:p-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">Stay Updated</h3>
          <p className="text-slate-300 font-medium text-sm sm:text-base max-w-xl mx-auto">
            Our goal is to provide helpful, practical, and up-to-date information to make renting and everyday living easier. Check back regularly for new articles and updates from the Swigo team.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
