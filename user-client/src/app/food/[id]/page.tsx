'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import toast from 'react-hot-toast';
import { getJSON, postAuthJSON } from '@/services/api';
import { getUser } from '@/services/auth.service';

export default function TiffinDetailPage() {
  const { id } = useParams();
  const [tiffin, setTiffin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  useEffect(() => {
    const fetchTiffin = async () => {
      try {
        const data = await getJSON(`/tiffins/${id}`);
        if (data.success) {
          setTiffin(data.data);
          if (data.data?.mealPlans?.length > 0) setSelectedPlan(data.data.mealPlans[0].name);
        }
      } catch (err) {
        toast.error('Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTiffin();
  }, [id]);

  const handleRequest = async () => {
    try {
      await postAuthJSON('/tiffins/interest', {
        tiffin: id,
        planSelected: selectedPlan,
        requestType: 'independent',
        message: `Interested in ${selectedPlan} plan.`
      });

      toast.success('Your interest has been sent to the provider!');
    } catch (err) {
      toast.error('Error sending request');
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!tiffin) return <div className="p-20 text-center">Service not found</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            {/* Header */}
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">{tiffin.name}</h1>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-slate-500 font-bold">
                <span>📍 {tiffin.area}, {tiffin.city}</span>
                <span className="flex items-center gap-1.5">⭐ 4.8 (120+ Reviews)</span>
              </div>
              <p className="text-base md:text-xl text-slate-600 leading-relaxed font-medium">
                {tiffin.description}
              </p>
            </div>

            {/* Menu */}
            <div className="space-y-6 md:space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Weekly Menu</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-primary transition-all duration-300">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60 mb-1">{day}</p>
                      <p className="font-bold text-slate-800 group-hover:text-white">{tiffin.menu?.[day] || 'Special Daily Thali'}</p>
                    </div>
                    <span className="text-xl md:text-2xl group-hover:scale-125 transition-transform">🍱</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Areas */}
            <div className="space-y-4 md:space-y-6">
               <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Delivery Areas</h2>
               <div className="flex flex-wrap gap-2 md:gap-3">
                 {tiffin.deliveryAreas?.map((area: string) => (
                   <span key={area} className="px-4 py-2 md:px-6 md:py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-slate-600 shadow-sm">
                     🚚 {area}
                   </span>
                 ))}
               </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <aside className="lg:col-span-1">
             <div className="sticky top-28 bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-6 md:space-y-10">
                <div>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1 md:mb-2">Monthly Subscription</p>
                   <p className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">₹{tiffin.price}<span className="text-base md:text-lg text-slate-500 font-bold">/mo</span></p>
                </div>

                <div className="space-y-3 md:space-y-4">
                   <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Choose a Plan</p>
                   {tiffin.mealPlans?.map((plan: any) => (
                     <button 
                       key={plan.name}
                       onClick={() => setSelectedPlan(plan.name)}
                       className={`w-full p-4 md:p-5 rounded-xl md:rounded-2xl border-2 text-left transition-all ${selectedPlan === plan.name ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}`}
                     >
                       <div className="flex justify-between items-center gap-2">
                         <p className="font-bold text-white text-sm md:text-base">{plan.name}</p>
                         <p className="font-black text-primary text-sm md:text-base">₹{plan.price}</p>
                       </div>
                       <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                     </button>
                   ))}
                </div>

                <button 
                  onClick={handleRequest}
                  className="w-full py-4 md:py-6 bg-primary text-white rounded-xl md:rounded-[2rem] font-black text-base md:text-xl hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95"
                >
                  Send Request
                </button>

                <p className="text-center text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                   🔒 Secure connection to provider
                </p>
             </div>
          </aside>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
