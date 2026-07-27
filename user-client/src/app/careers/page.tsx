'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CareersPage() {
  const perks = [
    { title: 'Collaborative Work Environment', icon: '🤝', desc: 'Work with talented engineers, designers, and business leads in a supportive atmosphere.' },
    { title: 'Opportunities to Learn & Grow', icon: '🚀', desc: 'Continuous learning, mentorship programs, and hands-on ownership of real projects.' },
    { title: 'Flexible & Innovative Culture', icon: '💡', desc: 'Fast-paced, creative freedom to test new ideas and build modern web tech.' },
    { title: 'Meaningful Impact on Users', icon: '🌟', desc: 'Build solutions that solve real housing and meal challenges for thousands daily.' },
    { title: 'Career Development & Mentorship', icon: '🌱', desc: 'Clear growth paths, regular feedback, and personal skill development.' },
  ];

  const roles = [
    { title: 'Software Engineering', dept: 'Engineering', location: 'Pune / Remote', type: 'Full-time', icon: '💻' },
    { title: 'Frontend Development', dept: 'Engineering', location: 'Pune / Remote', type: 'Full-time', icon: '⚛️' },
    { title: 'Backend Development', dept: 'Engineering', location: 'Pune / Remote', type: 'Full-time', icon: '⚙️' },
    { title: 'UI/UX Design', dept: 'Design', location: 'Pune / Hybrid', type: 'Full-time', icon: '🎨' },
    { title: 'Product Management', dept: 'Product', location: 'Pune / Hybrid', type: 'Full-time', icon: '📊' },
    { title: 'Customer Support', dept: 'Operations', location: 'Pune', type: 'Full-time', icon: '🎧' },
    { title: 'Sales & Business Development', dept: 'Growth', location: 'Multiple Cities', type: 'Full-time', icon: '📈' },
    { title: 'Digital Marketing', dept: 'Marketing', location: 'Pune / Remote', type: 'Full-time', icon: '📢' },
    { title: 'Quality Assurance', dept: 'Engineering', location: 'Pune / Remote', type: 'Full-time', icon: '🧪' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="space-y-6 mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
            Join Swigo Team
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Build the Future of Rental Living
          </h1>
          <p className="text-lg text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
            Join the team that's building the future of accommodation and lifestyle services. At Swigo, we're passionate about creating technology that helps people find homes, connect with trusted property owners, and access convenient daily services.
          </p>
        </div>

        {/* Why Work With Us */}
        <section className="mb-20 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white">Why Work With Us?</h2>
            <p className="text-slate-400 text-sm font-medium">Empowering environment built around innovation and teamwork.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((perk) => (
              <div key={perk.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-start gap-4 hover:border-slate-700 transition-all">
                <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0">{perk.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">{perk.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Current Opportunities */}
        <section className="mb-20 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white">Current Opportunities</h2>
            <p className="text-slate-400 text-sm font-medium">We are always interested in talented individuals across key functions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.title} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-purple-500/40 transition-all group flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">{role.dept}</span>
                    <span className="text-slate-500">{role.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">{role.title}</h3>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>📍 {role.location}</span>
                  <span className="text-purple-400 font-bold text-[11px] group-hover:underline">Apply Now →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spontaneous Application / Resume Banner */}
        <div className="p-8 sm:p-10 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30 text-center space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest">Spontaneous Application</span>
          <h3 className="text-2xl font-black text-white">Don't See a Matching Role?</h3>
          <p className="text-slate-300 font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            We're always looking for passionate people. Send us your resume and tell us how you can contribute to Swigo.
          </p>
          <div className="pt-2">
            <a 
              href="mailto:careers@swigo.com" 
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all text-sm shadow-xl shadow-purple-600/20"
            >
              ✉️ Send Your Resume
            </a>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-2">
            Thank you for considering a career with us. We look forward to building the future together.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
