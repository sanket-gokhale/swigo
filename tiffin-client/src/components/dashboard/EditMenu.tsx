'use client';

import React, { useState } from 'react';
import { getToken } from '../../services/auth.service';
import { API_BASE } from '../../services/api';
import toast from 'react-hot-toast';

export default function EditMenu({ tiffin, onUpdate, onClose }: { tiffin: any, onUpdate: () => void, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [menu, setMenu] = useState(tiffin.menu || {
    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/tiffins/${tiffin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ menu })
      });

      if (res.ok) {
        toast.success('Menu updated successfully!');
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Update failed');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-slate-900">Manage Weekly Menu</h2>
          <button onClick={onClose} className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.keys(menu).map((day) => (
              <div key={day} className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{day}</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                  value={(menu as any)[day]}
                  onChange={e => setMenu({ ...menu, [day]: e.target.value })}
                  placeholder={`What's for ${day}?`}
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Save Weekly Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
