'use client';

import React, { useEffect, useState } from 'react';
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

      console.log('Fetching requests from:', `${API_BASE}/bookings/user`);
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
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-40 rounded-[40px] bg-zinc-200 animate-pulse dark:bg-zinc-800" />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Visit Requests</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Track your scheduled visits to properties.</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Accepted', 'Rejected'].map(filter => (
            <button 
              key={filter} 
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                activeFilter === filter 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white text-zinc-400 border-zinc-100 hover:border-primary hover:text-primary dark:bg-zinc-900 dark:border-zinc-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {filteredRequests.length === 0 ? (
        <div className="text-center py-24 rounded-[40px] border-2 border-dashed border-zinc-800 bg-zinc-950/50">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-zinc-500 font-bold mb-6">
            {error ? error : `No ${activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} requests found.`}
          </p>
          <button 
            onClick={() => fetchRequests()}
            className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:bg-white/10 transition-all"
          >
            Refresh List
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredRequests.map((request) => (
            <div key={request._id} className="group relative flex flex-col md:flex-row gap-8 rounded-[40px] border border-zinc-800 bg-zinc-950 p-8 shadow-2xl transition-all hover:shadow-primary/5 hover:border-zinc-700">
              <div className="h-24 w-24 rounded-3xl bg-white/5 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                🏠
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-black text-xl text-zinc-50 tracking-tight">
                      {request.property?.title || 'Unknown Property'}
                    </h3>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Request ID: {request._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                
                <div className="flex flex-wrap gap-8 text-sm font-bold text-zinc-300 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-primary opacity-80">📅</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mr-1">Visiting:</span>
                    <span>{new Date(request.startDate).toLocaleDateString()}</span>
                  </div>
                  {request.visitTime && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary opacity-80">🕒</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mr-1">Time:</span>
                      <span>{request.visitTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-primary opacity-80">💰</span>
                    <span className="text-zinc-100">₹{request.property?.price || 0}/mo</span>
                  </div>
                </div>
                
                {request.message && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Your Message</p>
                    <p className="text-sm text-zinc-300 italic">"{request.message}"</p>
                  </div>
                )}

                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-200 font-medium">"{request.rejectionReason}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string, text: string, icon: string }> = {
    pending: { bg: 'bg-yellow-50 text-yellow-600 border-yellow-100', text: 'Pending', icon: '⏳' },
    accepted: { bg: 'bg-green-50 text-green-600 border-green-100', text: 'Accepted', icon: '✅' },
    confirmed: { bg: 'bg-green-50 text-green-600 border-green-100', text: 'Confirmed', icon: '✅' },
    rejected: { bg: 'bg-red-50 text-red-600 border-red-100', text: 'Rejected', icon: '❌' },
  };
  const config = configs[status] || configs.pending;
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${config.bg}`}>
      <span>{config.icon}</span> {config.text}
    </div>
  );
}
