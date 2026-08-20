'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getToken } from '@/services/auth.service';
import { API_BASE } from '@/services/api';

export default function FoodRequestList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Please login to view your food requests.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/tiffins/user/interests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        setError(data.message || 'Failed to load food requests');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return (
    <div className="space-y-4">
      {[1, 2].map(i => (
        <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse w-full" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900 tracking-tight">
        Expressed Tiffin Service Interests
      </h2>
      
      {requests.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xl mb-3">
            🍱
          </div>
          <p className="text-sm font-bold text-slate-700 mb-1">
            {error ? error : "No food service interests found."}
          </p>
          <p className="text-xs text-slate-400 mb-5">Browse delicious home-cooked tiffins and connect with providers.</p>
          <div className="flex items-center justify-center gap-3">
            <Link 
              href="/food" 
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              Explore Tiffins
            </Link>
            <button 
              onClick={() => fetchRequests()}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {requests.map((request) => {
            const tiffinImage = request.tiffin?.images?.[0] || '/tifin.jpeg';
            return (
              <div 
                key={request._id} 
                className="group relative flex flex-col md:flex-row gap-5 rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
              >
                {/* Tiffin Image */}
                <div className="relative h-44 md:h-auto md:w-52 rounded-2xl overflow-hidden bg-slate-100 shrink-0 group">
                  <img
                    src={tiffinImage}
                    alt={request.tiffin?.name || 'Tiffin'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {request.tiffin?.price && (
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/65 backdrop-blur-md text-white text-xs font-bold">
                      ₹{request.tiffin.price}<span className="text-[10px] font-normal text-slate-200">/mo</span>
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight line-clamp-1">
                          {request.tiffin?.name || 'Tiffin Service'}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          Plan: {request.planSelected || 'Standard'}
                        </p>
                      </div>
                      <div className={`self-start sm:self-auto px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${
                        request.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 
                        request.status === 'contacted' ? 'bg-blue-50 text-blue-700 border-blue-200/60' : 
                        'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      }`}>
                        {request.status}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 mb-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-600">📅</span>
                        <span className="text-slate-400 font-normal">Requested:</span>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-blue-600 shrink-0 mt-0.5">📍</span>
                        <span className="truncate">
                          {[request.tiffin?.address, request.tiffin?.area, request.tiffin?.city].filter(Boolean).join(', ') || 'Address not provided'}
                        </span>
                      </div>
                      {request.tiffin?.contactNumber && (
                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                          <span className="text-blue-600 shrink-0">📞</span>
                          <span>{request.tiffin.contactNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    {request.message && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Your Note:</span>
                        <p className="text-slate-700 italic">"{request.message}"</p>
                      </div>
                    )}
                  </div>

                  {request.tiffin?._id && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 mt-2">
                      <Link
                        href={`/food/${request.tiffin._id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link"
                      >
                        <span>View Tiffin Details</span>
                        <span className="transition-transform group-hover/link:translate-x-0.5">→</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

