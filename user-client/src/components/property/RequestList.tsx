'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getToken } from '@/services/auth.service';
import { API_BASE } from '@/services/api';

export default function RequestList() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        // Wait briefly for token to be available (common after login redirect)
        await new Promise(resolve => setTimeout(resolve, 800));
        const retryToken = getToken();
        if (!retryToken) {
          setLoading(false);
          return;
        }
      }

      const currentToken = getToken();
      if (!currentToken) {
        setError('Please login to view your requests.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/bookings/user`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        setError(data.message || 'Failed to load requests');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Server unreachable. Please ensure the backend is running at ' + API_BASE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending') return req.status === 'pending';
    if (activeFilter === 'Accepted') return req.status === 'accepted' || req.status === 'confirmed';
    if (activeFilter === 'Rejected') return req.status === 'rejected';
    return true;
  });

  if (loading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse w-full" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Scheduled Property Visits
        </h2>
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Pending', 'Accepted', 'Rejected'].map(filter => (
            <button 
              key={filter} 
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === filter 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {filteredRequests.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xl mb-3">
            📅
          </div>
          <p className="text-sm font-bold text-slate-700 mb-1">
            {error ? error : `No ${activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} visit requests found.`}
          </p>
          <p className="text-xs text-slate-400 mb-5">Browse properties to request a visit with property owners.</p>
          <div className="flex items-center justify-center gap-3">
            <Link 
              href="/search" 
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            >
              Explore Stays
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
          {filteredRequests.map((request) => {
            const propertyImage = request.property?.images?.[0] || '/hostel.jpeg';
            return (
              <div 
                key={request._id} 
                className="group relative flex flex-col md:flex-row gap-5 rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
              >
                {/* Property Image */}
                <div className="relative h-44 md:h-auto md:w-52 rounded-2xl overflow-hidden bg-slate-100 shrink-0 group">
                  <img
                    src={propertyImage}
                    alt={request.property?.title || 'Property'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {request.property?.type && (
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-blue-600 shadow-sm">
                      {request.property.type}
                    </div>
                  )}
                  {request.property?.price && (
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-black/65 backdrop-blur-md text-white text-xs font-bold">
                      ₹{request.property.price}<span className="text-[10px] font-normal text-slate-200">/mo</span>
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-extrabold text-lg text-slate-900 tracking-tight line-clamp-1">
                          {request.property?.title || 'Unknown Property'}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          ID: {request._id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    
                    {/* Date & Time Highlights */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 mb-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-600">📅</span>
                        <span className="text-slate-400 font-normal">Date:</span>
                        <span>{new Date(request.startDate).toLocaleDateString()}</span>
                      </div>
                      {request.visitTime && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-blue-600">🕒</span>
                          <span className="text-slate-400 font-normal">Time:</span>
                          <span>{request.visitTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Address & Host Contact */}
                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex items-start gap-1.5 text-slate-500">
                        <span className="text-blue-600 shrink-0 mt-0.5">📍</span>
                        <span className="truncate">
                          {[request.property?.address, request.property?.area, request.property?.city].filter(Boolean).join(', ') || request.property?.location || 'Address not provided'}
                        </span>
                      </div>
                      {request.property?.contactNumber && (
                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                          <span className="text-blue-600 shrink-0">📞</span>
                          <span>{request.property.contactNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    {request.message && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Your Note:</span>
                        <p className="text-slate-700 italic">"{request.message}"</p>
                      </div>
                    )}

                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700">
                        <span className="font-bold block mb-0.5">Host note:</span>
                        <p>"{request.rejectionReason}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {request.property?._id && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 mt-2">
                      <Link
                        href={`/property/${request.property._id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link"
                      >
                        <span>View Property</span>
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

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string, text: string, icon: string }> = {
    pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200/60', text: 'Pending', icon: '⏳' },
    accepted: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', text: 'Accepted', icon: '✅' },
    confirmed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', text: 'Confirmed', icon: '✅' },
    rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200/60', text: 'Declined', icon: '❌' },
  };
  const config = configs[status] || configs.pending;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${config.bg}`}>
      <span>{config.icon}</span> {config.text}
    </div>
  );
}

