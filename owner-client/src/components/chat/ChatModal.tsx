'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getToken } from '@/services/auth.service';
import { API_BASE } from '@/services/api';
import toast from 'react-hot-toast';

interface ChatModalProps {
  partnerId: string;
  partnerName: string;
  onClose: () => void;
}

export default function ChatModal({ partnerId, partnerName, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  
  // Custom tool toggles
  const [showMealForm, setShowMealForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  
  // Meal Form States
  const [mealName, setMealName] = useState('');
  const [mealDesc, setMealDesc] = useState('');
  
  // Pricing Form States
  const [planName, setPlanName] = useState('');
  const [price, setPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/messages/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 3 seconds for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [partnerId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          receiver: partnerId,
          content: inputText,
          messageType: 'text'
        })
      });
      if (res.ok) {
        setInputText('');
        fetchMessages();
      }
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleSendMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !mealDesc.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          receiver: partnerId,
          content: `Shared Meal Plan: ${mealName}`,
          messageType: 'meal_details',
          mealDetails: {
            name: mealName,
            description: mealDesc
          }
        })
      });
      if (res.ok) {
        setMealName('');
        setMealDesc('');
        setShowMealForm(false);
        fetchMessages();
        toast.success('Meal details shared!');
      }
    } catch (err) {
      toast.error('Failed to share meal details');
    }
  };

  const handleSendPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim() || !price) return;

    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          receiver: partnerId,
          content: `Shared Pricing: ${planName} - ₹${price}/${billingCycle}`,
          messageType: 'pricing',
          pricingDetails: {
            planName,
            price: Number(price),
            billingCycle
          }
        })
      });
      if (res.ok) {
        setPlanName('');
        setPrice('');
        setShowPriceForm(false);
        fetchMessages();
        toast.success('Pricing proposal shared!');
      }
    } catch (err) {
      toast.error('Failed to share pricing');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 text-left">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {partnerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">{partnerName}</h3>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Connection
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/20 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full mb-2" />
              <p className="text-sm font-semibold">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <span className="text-4xl mb-3">💬</span>
              <p className="text-sm font-bold">No messages yet.</p>
              <p className="text-xs">Say hello or share menu/pricing proposals to start collaborating!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === partnerId ? false : true;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-[1.5rem] p-4 text-sm font-medium ${
                    isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    
                    {/* Render message contents by type */}
                    {msg.messageType === 'text' && <p className="leading-relaxed">{msg.content}</p>}
                    
                    {msg.messageType === 'meal_details' && (
                      <div className={`rounded-xl p-4 border flex flex-col gap-2 ${
                        isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-orange-50/50 border-orange-100 text-orange-900'
                      }`}>
                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-orange-500">
                          🍳 Shared Meal Plan
                        </div>
                        <h4 className="font-extrabold text-base leading-snug">{msg.mealDetails?.name}</h4>
                        <p className="text-xs font-semibold opacity-90 leading-relaxed">{msg.mealDetails?.description}</p>
                      </div>
                    )}

                    {msg.messageType === 'pricing' && (
                      <div className={`rounded-xl p-4 border flex flex-col gap-2 ${
                        isMe ? 'bg-white/10 border-white/20 text-white' : 'bg-emerald-50/50 border-emerald-100 text-emerald-900'
                      }`}>
                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-emerald-500">
                          💰 Shared Pricing Proposal
                        </div>
                        <h4 className="font-extrabold text-base leading-snug">{msg.pricingDetails?.planName}</h4>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black">₹{msg.pricingDetails?.price}</span>
                          <span className="text-[10px] font-bold opacity-75">/ {msg.pricingDetails?.billingCycle}</span>
                        </div>
                      </div>
                    )}

                    <span className={`block text-[9px] mt-1.5 text-right opacity-60`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Tools Panel */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex gap-2">
          <button
            onClick={() => {
              setShowMealForm(!showMealForm);
              setShowPriceForm(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              showMealForm ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
            }`}
          >
            🍳 Share Menu/Meal
          </button>
          <button
            onClick={() => {
              setShowPriceForm(!showPriceForm);
              setShowMealForm(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              showPriceForm ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            💰 Share Pricing
          </button>
        </div>

        {/* Sub-Forms */}
        {showMealForm && (
          <form onSubmit={handleSendMeal} className="p-6 border-t border-slate-100 bg-orange-50/10 space-y-4 animate-in slide-in-from-bottom-2 duration-150">
            <h4 className="font-black text-xs uppercase tracking-widest text-orange-600">Share Meal Plan Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Meal Name (e.g. Standard Lunch Thali)"
                required
                className="col-span-2 p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 font-bold text-sm"
                value={mealName}
                onChange={e => setMealName(e.target.value)}
              />
              <textarea
                placeholder="Description / items (e.g. Rice, Dal, 4 Rotis, Seasonal Veg, Salad)"
                required
                rows={2}
                className="col-span-2 p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 font-medium text-sm"
                value={mealDesc}
                onChange={e => setMealDesc(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowMealForm(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600">
                Post Meal Details
              </button>
            </div>
          </form>
        )}

        {showPriceForm && (
          <form onSubmit={handleSendPricing} className="p-6 border-t border-slate-100 bg-emerald-50/10 space-y-4 animate-in slide-in-from-bottom-2 duration-150">
            <h4 className="font-black text-xs uppercase tracking-widest text-emerald-600">Share Pricing Proposal</h4>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Plan Name (e.g. Monthly Standard)"
                required
                className="col-span-3 p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Price (₹)"
                required
                className="col-span-2 p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
              <select
                className="p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                value={billingCycle}
                onChange={e => setBillingCycle(e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowPriceForm(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600">
                Post Price Proposal
              </button>
            </div>
          </form>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendText} className="p-6 border-t border-slate-100 bg-white flex gap-4 items-center">
          <input
            type="text"
            placeholder="Type your message here..."
            className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold text-slate-800 placeholder:text-slate-300"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
          />
          <button 
            type="submit"
            className="px-6 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
