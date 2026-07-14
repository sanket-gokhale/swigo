'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { getToken } from '../../services/auth.service';
import { API_BASE } from '../../services/api';
import toast from 'react-hot-toast';

export default function IncomingRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/tiffins/provider/interests`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_BASE}/tiffins/interest/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Request ${status}`);
        fetchRequests();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Food Requests</h1>
            <p className="text-slate-500 font-medium">Manage incoming interests from properties and direct users.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-white rounded-full text-xs font-bold text-slate-600 border border-slate-100 shadow-sm">
              Total: {requests.length}
            </span>
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
          ) : (
            requests.map((req) => (
              <div key={req._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:shadow-xl transition-all">
                <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {req.requestType === 'property-linked' ? '🏠' : '🍱'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      req.requestType === 'property-linked' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {req.requestType === 'property-linked' ? 'Property Linked' : 'Independent Order'}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">• {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{req.user?.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{req.user?.email}</p>
                  {req.planSelected && (
                    <p className="mt-2 text-sm font-bold text-primary">Plan: {req.planSelected}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${
                    req.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                    req.status === 'contacted' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {req.status}
                  </span>
                  
                  <div className="flex gap-2">
                    {req.status === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(req._id, 'contacted')}
                        className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-primary transition-all shadow-lg shadow-slate-200"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {req.status === 'contacted' && (
                      <button 
                        onClick={() => handleStatusUpdate(req._id, 'completed')}
                        className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      >
                        Complete Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {!loading && requests.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <p className="text-5xl mb-4">📥</p>
               <h3 className="text-xl font-bold text-slate-900">No requests yet</h3>
               <p className="text-slate-500">When users express interest, they will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
