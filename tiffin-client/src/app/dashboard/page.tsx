'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import { isAuthenticated, getToken, getUser, getProfile } from '../../services/auth.service';
import { API_BASE } from '../../services/api';
import RegisterKitchen from '../../components/dashboard/RegisterKitchen';
import EditMenu from '../../components/dashboard/EditMenu';
import EditAreas from '../../components/dashboard/EditAreas';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tiffin, setTiffin] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [activeModal, setActiveModal] = useState<'menu' | 'areas' | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    const localUser = getUser();
    if (!localUser || !isAuthenticated()) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    
    setUser(localUser);
    
    if (localUser.role !== 'tiffin' && localUser.role !== 'admin') {
      router.push('/login?error=Unauthorized access');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/tiffins/my-service`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTiffin(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch tiffin service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [router]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20" />
      </div>
    );
  }

  if (!tiffin) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <main className="mx-auto max-w-7xl px-8 py-16">
           <RegisterKitchen onSuccess={fetchDashboardData} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      
      {activeModal === 'menu' && (
        <EditMenu tiffin={tiffin} onUpdate={fetchDashboardData} onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'areas' && (
        <EditAreas tiffin={tiffin} onUpdate={fetchDashboardData} onClose={() => setActiveModal(null)} />
      )}

      <main className="mx-auto max-w-7xl px-8 py-16 sm:px-10 lg:px-12">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">Management Portal</span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800">{tiffin.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-slate-500 font-medium text-lg">{tiffin.area}, {tiffin.city}</p>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                tiffin.type === 'independent' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {tiffin.type || 'Independent'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 rounded-[2rem] border border-slate-100 bg-slate-50 p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/20">
              <span className="text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'P'}
              </span>
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">{user?.name}</p>
              <p className="text-xs font-medium text-slate-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Quick Stats */}
          <div className="card-modern p-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="mt-3 text-5xl font-black text-white">₹0</p>
            <div className="mt-4 h-1.5 w-12 rounded-full bg-primary" />
          </div>
          <div className="card-modern p-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Plans</p>
            <p className="mt-3 text-5xl font-black text-white">{tiffin.mealPlans?.length || 0}</p>
            <div className="mt-4 h-1.5 w-12 rounded-full bg-secondary" />
          </div>
          <div className="card-modern p-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Areas</p>
            <p className="mt-3 text-5xl font-black text-white">{tiffin.deliveryAreas?.length || 0}</p>
            <div className="mt-4 h-1.5 w-12 rounded-full bg-primary" />
          </div>
        </div>

        {/* Showcase Food Photos Banner */}
        {tiffin.images && tiffin.images.length > 0 && (
          <div className="mt-12 rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-widest mb-1">Live Menu Showcase</span>
                <h2 className="text-2xl font-black">Your Food &amp; Kitchen Photos ({tiffin.images.length})</h2>
              </div>
              <button onClick={() => router.push('/profile')} className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-white flex items-center gap-2">
                <span>✏️</span> Manage Photos
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {tiffin.images.map((img: string, idx: number) => (
                <div key={idx} className="relative h-40 w-64 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                  <img src={img} alt={`Food ${idx + 1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white">
                    Photo #{idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="card-modern p-10 shadow-primary/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Kitchen Tools</h2>
              <button className="text-sm font-bold text-primary hover:underline">View Analytics</button>
            </div>
            <div className="space-y-4">
               <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Menu (Today)</p>
                 <p className="text-white font-bold text-lg">{tiffin.menu?.[new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()] || 'No menu set for today'}</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Base Price</p>
                    <p className="text-white font-black text-2xl">₹{tiffin.price}</p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-primary font-black text-2xl italic">Active</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Provider Tools */}
          <div className="card-modern p-10 shadow-primary/5">
            <h2 className="text-2xl font-bold text-white mb-8">Management</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <button onClick={() => router.push('/requests')} className="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-white/5 p-8 transition-all hover:bg-primary/20 hover:shadow-lg group">
                <span className="text-4xl group-hover:scale-110 transition-transform">📋</span>
                <span className="text-sm font-bold text-slate-300">Requests</span>
              </button>
              <button onClick={() => setActiveModal('menu')} className="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-white/5 p-8 transition-all hover:bg-primary/20 hover:shadow-lg group">
                <span className="text-4xl group-hover:scale-110 transition-transform">🥘</span>
                <span className="text-sm font-bold text-slate-300">Edit Menu</span>
              </button>
              <button onClick={() => router.push('/profile')} className="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-primary/20 border border-primary/30 p-8 transition-all hover:bg-primary/30 hover:shadow-lg group shadow-xl shadow-primary/10">
                <span className="text-4xl group-hover:scale-110 transition-transform">📸</span>
                <span className="text-sm font-bold text-white">Profile & Photos</span>
              </button>
              <button onClick={() => router.push('/find-properties')} className="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-white/5 p-8 transition-all hover:bg-primary/20 hover:shadow-lg group">
                <span className="text-4xl group-hover:scale-110 transition-transform">🏠</span>
                <span className="text-sm font-bold text-slate-300">Find Properties</span>
              </button>
              <button onClick={() => setActiveModal('areas')} className="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-white/5 p-8 transition-all hover:bg-primary/20 hover:shadow-lg group">
                <span className="text-4xl group-hover:scale-110 transition-transform">🚚</span>
                <span className="text-sm font-bold text-slate-300">Areas</span>
              </button>
              <button onClick={() => router.push('/collabs')} className="flex flex-col items-center justify-center gap-4 rounded-[2rem] bg-white/5 p-8 transition-all hover:bg-primary/20 hover:shadow-lg group">
                <span className="text-4xl group-hover:scale-110 transition-transform">🤝</span>
                <span className="text-sm font-bold text-slate-300">Partnerships</span>
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
