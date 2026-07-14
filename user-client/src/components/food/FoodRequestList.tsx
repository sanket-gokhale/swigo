'use client';

import React, { useEffect, useState } from 'react';
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
    <div className="space-y-6">
      {[1, 2].map(i => (
        <div key={i} className="h-40 rounded-[40px] bg-zinc-100 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Food Interests</h1>
        <p className="text-zinc-500 mt-1 font-medium">Manage your expressed interests for tiffin services.</p>
      </div>
      
      {requests.length === 0 ? (
        <div className="text-center py-24 rounded-[40px] border-2 border-dashed border-zinc-100 bg-zinc-50/50">
          <div className="text-4xl mb-4">🍱</div>
          <p className="text-zinc-500 font-bold mb-6">
            {error ? error : "No food interests found."}
          </p>
          <button 
            onClick={() => fetchRequests()}
            className="px-8 py-3 rounded-2xl bg-white border border-zinc-200 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 transition-all"
          >
            Refresh List
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request._id} className="group relative flex flex-col md:flex-row gap-8 rounded-[40px] border border-zinc-100 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-primary/20">
              <div className="h-24 w-24 rounded-3xl bg-primary/5 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                🍱
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-black text-xl text-zinc-900 tracking-tight">
                      {request.tiffin?.name || 'Tiffin Service'}
                    </h3>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Plan: {request.planSelected}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                    request.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                    request.status === 'contacted' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {request.status}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-8 text-sm font-bold text-zinc-600 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-primary opacity-80">📅</span>
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary opacity-80">💰</span>
                    <span>₹{request.tiffin?.price}/mo</span>
                  </div>
                </div>
                
                {request.message && (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Your Message</p>
                    <p className="text-sm text-zinc-600 italic">"{request.message}"</p>
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
