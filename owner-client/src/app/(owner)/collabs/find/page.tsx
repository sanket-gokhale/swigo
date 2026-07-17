'use client';

import React, { useState, useEffect } from 'react';
import { getJSON, getAuthJSON, postAuthJSON } from '@/services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function FindProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');

  // Modals / Selection States
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProviders = async (city = '') => {
    setLoading(true);
    try {
      const data = await getJSON(`/tiffins?city=${city}`);
      setProviders(data.data || data || []);
    } catch (err) {
      toast.error('Failed to load tiffin providers');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProperties = async () => {
    try {
      const data = await getAuthJSON('/properties/my-properties');
      setMyProperties(data.data || data || []);
    } catch (err) {
      console.error('Failed to load my properties');
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchMyProperties();
  }, []);

  const handleProposeClick = (provider: any) => {
    setSelectedProvider(provider);
    setShowProposeModal(true);
    // Auto-select first property if available
    if (myProperties.length > 0) {
      setSelectedPropertyId(myProperties[0]._id);
    }
    setProposalMessage(`Hi, I would love to collaborate with ${provider.name} to offer food service to my residents.`);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId) {
      toast.error('Please select one of your properties');
      return;
    }

    setIsSubmitting(true);
    try {
      await postAuthJSON('/collabs', {
        tiffin: selectedProvider._id,
        property: selectedPropertyId,
        provider: selectedProvider.provider?._id || selectedProvider.provider,
        message: proposalMessage
      });

      toast.success('Collaboration proposal sent successfully!');
      setShowProposeModal(false);
      setSelectedProvider(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-left">
      
      {/* Detail Modal */}
      {selectedProvider && !showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-xl text-slate-800">Tiffin Provider Profile</h3>
              <button 
                onClick={() => setSelectedProvider(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-8">
              <div>
                <h4 className="text-2xl font-black text-slate-900">{selectedProvider.name}</h4>
                <p className="text-sm font-bold text-primary mt-1">📍 {selectedProvider.area}, {selectedProvider.city}</p>
                <p className="text-slate-500 font-medium mt-3 leading-relaxed text-sm">{selectedProvider.description}</p>
              </div>

              {/* Weekly Menu */}
              {selectedProvider.menu && (
                <div className="space-y-3">
                  <h5 className="font-black text-xs uppercase tracking-widest text-slate-400">Weekly Menu</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedProvider.menu).map(([day, val]) => (
                      <div key={day} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <span className="font-black capitalize text-slate-700 block mb-1">{day}</span>
                        <span className="text-slate-500 font-medium italic">"{val as string || 'Standard Meal'}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meal Plans */}
              {selectedProvider.mealPlans && selectedProvider.mealPlans.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-black text-xs uppercase tracking-widest text-slate-400">Meal Plans</h5>
                  <div className="space-y-2">
                    {selectedProvider.mealPlans.map((plan: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-extrabold text-slate-800">{plan.name}</p>
                          <p className="text-xs text-slate-400 font-medium">{plan.description}</p>
                        </div>
                        <p className="font-black text-primary text-lg">₹{plan.price}<span className="text-xs font-bold text-slate-400">/mo</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm"
              >
                Back
              </button>
              <button 
                onClick={() => setShowProposeModal(true)}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                Propose Collaboration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Propose Proposal Modal */}
      {showProposeModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <form onSubmit={handleSubmitProposal} className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-extrabold text-xl text-slate-800">Propose Partnership</h3>
              <button 
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tiffin Partner</p>
                <p className="font-extrabold text-slate-800 text-lg">{selectedProvider.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Link to Property</label>
                {myProperties.length === 0 ? (
                  <p className="text-rose-500 text-xs font-bold bg-rose-50 p-4 rounded-xl border border-rose-100">
                    You do not have any properties listed yet! Please create a property first.
                  </p>
                ) : (
                  <select
                    required
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-bold text-sm"
                    value={selectedPropertyId}
                    onChange={e => setSelectedPropertyId(e.target.value)}
                  >
                    {myProperties.map(prop => (
                      <option key={prop._id} value={prop._id}>{prop.title} ({prop.area})</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Custom Proposal Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary font-medium text-sm"
                  placeholder="Introduce yourself and specify terms..."
                  value={proposalMessage}
                  onChange={e => setProposalMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
              <button 
                type="button" 
                onClick={() => setShowProposeModal(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm"
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || myProperties.length === 0}
                className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center gap-4">
        <Link href="/collabs" className="h-10 w-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
          ←
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Search Tiffin Providers</h1>
          <p className="text-slate-500 font-medium">Find local kitchen services and collaborate to offer meal services at your stays.</p>
        </div>
      </div>

      {/* Search Filter Box */}
      <div className="mb-12 flex gap-4 bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100 max-w-2xl">
        <div className="flex-1 flex items-center px-6 gap-4">
          <span className="text-2xl">🔍</span>
          <input 
            type="text" 
            placeholder="Search by city (e.g. Nagpur, Mumbai)..." 
            className="w-full bg-transparent border-none outline-none font-bold text-slate-800 placeholder:text-slate-300 py-4"
            value={searchCity}
            onChange={e => setSearchCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchProviders(searchCity)}
          />
        </div>
        <button 
          onClick={() => fetchProviders(searchCity)}
          className="px-10 py-4 bg-primary text-white rounded-[1.5rem] font-black hover:opacity-90 transition-all"
        >
          Search
        </button>
      </div>

      {/* Grid of Providers */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-[2.5rem] bg-white animate-pulse" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100">
          <p className="text-5xl mb-4">🍲</p>
          <h3 className="text-xl font-bold text-slate-900">No tiffin kitchens found</h3>
          <p className="text-slate-500 mt-2">Try searching a different city or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map(provider => {
            const providerName = provider.name || 'Grandma Kitchen';
            const location = `${provider.area}, ${provider.city}`;
            const initial = providerName.charAt(0).toUpperCase();

            return (
              <div key={provider._id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xl">
                    {initial}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight line-clamp-1">{providerName}</h3>
                    <p className="text-xs text-slate-400 font-bold mt-1">📍 {location}</p>
                  </div>
                </div>

                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 line-clamp-3">
                  {provider.description || 'No description provided.'}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Rate</span>
                    <p className="font-black text-slate-900 text-xl">₹{provider.price}<span className="text-xs font-bold text-slate-400">/mo</span></p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedProvider(provider)}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs"
                    >
                      Profile
                    </button>
                    <button 
                      onClick={() => handleProposeClick(provider)}
                      className="px-4 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/10 hover:scale-105 transition-all"
                    >
                      Propose
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
