'use client';

import React, { useEffect, useState } from 'react';
import { getToken } from '../../services/auth.service';
import { API_BASE } from '../../services/api';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import ChatModal from '@/components/chat/ChatModal';
import Link from 'next/link';

export default function ProviderCollabsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  
  // Chat Modal States
  const [activeChat, setActiveChat] = useState<{ id: string; name: string } | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/collabs/provider`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setRequests(data.data || []);
    } catch (err) {
      toast.error('Failed to load collaboration requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected' | 'cancelled') => {
    try {
      const res = await fetch(`${API_BASE}/collabs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        toast.success(`Request ${status} successfully!`);
        fetchRequests();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Filter requests
  const receivedRequests = requests.filter(r => r.initiatedBy === 'owner');
  const sentRequests = requests.filter(r => r.initiatedBy === 'provider');
  const currentRequests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {activeChat && (
        <ChatModal 
          partnerId={activeChat.id} 
          partnerName={activeChat.name} 
          onClose={() => setActiveChat(null)} 
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Partnerships Manager</h1>
            <p className="text-slate-500 font-medium text-lg">Propose and manage partnerships with properties to serve food to their residents.</p>
          </div>
          <Link 
            href="/find-properties"
            className="self-start sm:self-auto px-6 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 whitespace-nowrap"
          >
            🏠 Find Properties
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-100 pb-2 mb-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-4 px-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'received'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📥 Received Proposals ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-4 px-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'sent'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📤 Sent Proposals ({sentRequests.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-10 sm:p-20 text-center">
            <div className="text-5xl sm:text-6xl mb-6">🤝</div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800">No requests found</h3>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              {activeTab === 'received' 
                ? 'When property owners invite your kitchen to serve, invitations will appear here.'
                : 'Propose collaborations to properties to serve their residents.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {currentRequests.map((request) => {
              const partnerName = request.owner?.name || 'Property Owner';
              const location = request.property?.city ? `${request.property.area}, ${request.property.city}` : 'Pune';
              const initial = partnerName.charAt(0).toUpperCase();

              return (
                <div key={request._id} className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-500 group">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center">
                    
                    {/* Avatar & Partner Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                        {initial}
                      </div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5 border border-slate-100">
                          {request.status}
                        </span>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">{partnerName}</h3>
                        <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                          📍 {location}
                        </p>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex-1 w-full">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Property Listing</p>
                      <p className="text-sm font-extrabold text-slate-700 mt-0.5">{request.property?.title}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1 truncate">Message: "{request.message}"</p>
                    </div>

                    {/* Status Badges & Details */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 w-full lg:w-auto">
                      <div className="text-left lg:text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Proposed</p>
                        <p className="text-sm font-bold text-slate-700 mt-0.5">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {/* Action buttons based on status & tab */}
                        {request.status === 'pending' && activeTab === 'received' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(request._id, 'accepted')}
                              className="px-5 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(request._id, 'rejected')}
                              className="px-5 py-3 bg-white text-slate-400 border border-slate-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {request.status === 'pending' && activeTab === 'sent' && (
                          <button 
                            onClick={() => handleStatusUpdate(request._id, 'cancelled')}
                            className="px-5 py-3 bg-white text-rose-500 border border-rose-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 transition-all"
                          >
                            Cancel Proposal
                          </button>
                        )}

                        {request.status === 'accepted' && (
                          <button 
                            onClick={() => setActiveChat({ id: request.owner?._id || request.owner, name: partnerName })}
                            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2 shadow-lg shadow-slate-100"
                          >
                            💬 Chat with Partner
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
