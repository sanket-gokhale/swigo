'use client';

import React, { useState } from 'react';
import { getToken } from '../../services/auth.service';
import { API_BASE } from '../../services/api';
import toast from 'react-hot-toast';

export default function RegisterKitchen({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: 'Pune',
    area: '',
    price: 3000,
    type: 'independent',
    deliveryAreas: '',
    mealPlans: [
      { name: 'Basic Veg', price: 3000, description: 'Lunch & Dinner' },
      { name: 'Premium Veg', price: 4500, description: 'Breakfast, Lunch & Dinner' }
    ],
    menu: {
      monday: 'Dal Makhani, Mix Veg, Roti, Rice',
      tuesday: 'Paneer Masala, Jeera Aloo, Roti, Rice',
      wednesday: 'Chole Masala, Bhindi Fry, Roti, Rice',
      thursday: 'Rajma Masala, Lauki Kofta, Roti, Rice',
      friday: 'Paneer Butter Masala, Mix Veg, Roti, Rice',
      saturday: 'Aloo Gobhi, Dal Tadka, Roti, Rice',
      sunday: 'Special Thali, Sweet'
    },
    images: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80'
    ]
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success('Location captured successfully!');
      }, (err) => {
        toast.error('Failed to get location. Using default.');
      });
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  const getCoordinatesFromAddress = async () => {
    if (!formData.city || !formData.area) {
      toast.error('Please enter City and Area first.');
      return;
    }
    setLoading(true);
    try {
      const query = encodeURIComponent(`${formData.area}, ${formData.city}`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        setCoords({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
        toast.success('Location coordinates resolved from address!');
      } else {
        toast.error('Could not find location coordinates for this address.');
      }
    } catch (err) {
      toast.error('Error resolving coordinates from address.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        deliveryAreas: formData.deliveryAreas.split(',').map(a => a.trim()).filter(a => a),
        coordinates: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        }
      };

      const res = await fetch(`${API_BASE}/tiffins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Kitchen registered successfully!');
        onSuccess();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Register Your Kitchen</h2>
          <p className="text-slate-500 font-medium text-lg">Tell us about your home food service to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kitchen Name</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-bold"
                placeholder="e.g. Grandma's Kitchen"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Price (Monthly)</label>
              <input
                type="number"
                required
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-bold"
                placeholder="e.g. 3000"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
            <textarea
              required
              rows={3}
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-medium"
              placeholder="Describe your food, quality, and specialty..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-bold"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Area / Locality</label>
              <input
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-bold"
                placeholder="e.g. Kothrud"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pin Location Coordinates</label>
              <div className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700 select-none">
                {coords.lat !== 0 || coords.lng !== 0 
                  ? `Latitude: ${coords.lat.toFixed(6)}, Longitude: ${coords.lng.toFixed(6)}` 
                  : 'Location not pinned yet'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Set Coordinates Option</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={getLocation}
                  className="w-full h-[58px] rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  📍 GPS Location
                </button>
                <button
                  type="button"
                  onClick={getCoordinatesFromAddress}
                  className="w-full h-[58px] rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/5"
                >
                  🔍 Address Location
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Delivery Areas (Comma separated)</label>
            <input
              type="text"
              required
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none font-bold"
              placeholder="e.g. Kothrud, Karve Nagar, Deccan"
              value={formData.deliveryAreas}
              onChange={e => setFormData({ ...formData, deliveryAreas: e.target.value })}
            />
          </div>

          <div className="space-y-6">
             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
               <span className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm">📋</span>
               Weekly Menu Setup
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.menu).map((day) => (
                  <div key={day} className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{day}</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                      value={(formData.menu as any)[day]}
                      onChange={e => setFormData({
                        ...formData,
                        menu: { ...formData.menu, [day]: e.target.value }
                      })}
                    />
                  </div>
                ))}
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-xl hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Creating Service...' : 'Launch Kitchen 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
