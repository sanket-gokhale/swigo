'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import { getToken, getUser } from '../../services/auth.service';
import { API_BASE } from '../../services/api';
import toast from 'react-hot-toast';

export default function TiffinProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tiffinData, setTiffinData] = useState<any>(null);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    area: '',
    price: '',
    deliveryAreas: '',
    isStandalone: true,
    type: 'independent',
    menu: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    }
  });

  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const curatedFoodPhotos = [
    { name: 'Special North Indian Thali', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80' },
    { name: 'Dal Makhani & Roti Bowl', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80' },
    { name: 'Paneer Butter Masala Meal', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80' },
    { name: 'Traditional South Indian Thali', url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80' },
    { name: 'Homely Dal Tadka & Rice', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80' }
  ];

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
    toast.success('Photo added!');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    toast.success('Photo removed');
  };

  const addCuratedImage = (url: string) => {
    if (images.includes(url)) {
      toast.error('Photo already added!');
      return;
    }
    setImages([...images, url]);
    toast.success('Sample food photo added!');
  };

  useEffect(() => {
    fetchTiffinProfile();
  }, []);

  const fetchTiffinProfile = async () => {
    try {
      const user = getUser();
      const res = await fetch(`${API_BASE}/tiffins/my-service`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const envelope = await res.json();
        const data = envelope.data || envelope;
        setTiffinData(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          city: data.city || '',
          area: data.area || '',
          price: data.price || '',
          deliveryAreas: data.deliveryAreas?.join(', ') || '',
          isStandalone: data.isStandalone ?? true,
          type: data.type || 'independent',
          menu: data.menu || formData.menu
        });
        setMealPlans(data.mealPlans || []);
        setImages(data.images || []);
        if (data.coordinates?.coordinates) {
          setCoords({
            lat: data.coordinates.coordinates[1],
            lng: data.coordinates.coordinates[0]
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);
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
      setSaving(false);
    }
  };

  const addMealPlan = () => {
    setMealPlans([...mealPlans, { name: '', price: '', description: '' }]);
  };

  const removeMealPlan = (index: number) => {
    setMealPlans(mealPlans.filter((_, i) => i !== index));
  };

  const updateMealPlan = (index: number, field: string, value: any) => {
    const updated = [...mealPlans];
    updated[index][field] = value;
    setMealPlans(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        deliveryAreas: formData.deliveryAreas.split(',').map(s => s.trim()).filter(s => s),
        mealPlans,
        images,
        coordinates: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        }
      };

      const res = await fetch(`${API_BASE}/tiffins${tiffinData ? `/${tiffinData._id}` : ''}`, {
        method: tiffinData ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Service updated successfully!');
        fetchTiffinProfile();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      toast.error('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Manage Tiffin Service</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="p-2 bg-primary/10 text-primary rounded-lg text-lg">🏠</span>
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Service Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Annapurna Tiffin Center"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary"
                  placeholder="Describe your food quality, hygiene, and specialization..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Area</label>
                <input 
                  type="text" 
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Pin Location Coordinates</label>
                  <div className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold select-none h-[56px] flex items-center">
                    {coords.lat !== 0 || coords.lng !== 0 
                      ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` 
                      : 'Location not pinned yet'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={getLocation}
                    className="w-full h-[56px] rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    📍 GPS Location
                  </button>
                  <button
                    type="button"
                    onClick={getCoordinatesFromAddress}
                    className="w-full h-[56px] rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/5"
                  >
                    🔍 Address Location
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Provider Type</label>
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary"
                >
                  <option value="independent">Independent (Direct to User)</option>
                  <option value="owner-collab">Owner Collab (Linked to Property)</option>
                </select>
                <p className="mt-2 text-xs text-slate-400">
                  {formData.type === 'independent' 
                    ? 'Users can find you in the food search and order directly.' 
                    : 'You will be linked to a specific property by the owner.'}
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Delivery Areas (Comma separated)</label>
                <input 
                  type="text" 
                  value={formData.deliveryAreas}
                  onChange={e => setFormData({...formData, deliveryAreas: e.target.value})}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary"
                  placeholder="Sector 62, Sector 63, Indirapuram..."
                />
              </div>
            </div>
          </section>

          {/* Food & Kitchen Showcase Photos */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span className="p-2 bg-pink-100 text-pink-600 rounded-lg text-lg">📸</span>
              Food &amp; Kitchen Showcase Photos
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Upload high-resolution photos of your tiffin meals, thalis, and hygienic kitchen setup to attract subscribers.
            </p>

            {/* Custom URL Input */}
            <div className="flex gap-3 mb-6">
              <input
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="Paste Image URL (https://...)"
                className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="px-6 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all shrink-0"
              >
                + Add Photo
              </button>
            </div>

            {/* Quick Curated Selection */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                ⚡ Quick Select Sample Professional Food Photos
              </label>
              <div className="flex flex-wrap gap-2">
                {curatedFoodPhotos.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addCuratedImage(photo.url)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-xs font-bold transition-all border border-transparent hover:border-pink-200 flex items-center gap-1.5"
                  >
                    <span>+</span> {photo.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {images.map((url, idx) => (
                <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm aspect-video">
                  <img src={url} alt={`Food preview ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                    <span className="text-white text-[10px] font-black uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-full">Photo #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="bg-red-500 text-white p-1.5 rounded-lg text-xs hover:bg-red-600 transition-colors shadow-lg"
                      title="Remove Photo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <p className="text-slate-400 text-sm font-medium">No food photos added yet. Use the URL box or click sample buttons above!</p>
                </div>
              )}
            </div>
          </section>

          {/* Weekly Menu */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="p-2 bg-orange-100 text-orange-600 rounded-lg text-lg">📋</span>
              Weekly Menu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(formData.menu).map((day) => (
                <div key={day}>
                  <label className="block text-sm font-semibold text-slate-600 mb-1 capitalize">{day}</label>
                  <input 
                    type="text" 
                    value={(formData.menu as any)[day]}
                    onChange={e => setFormData({
                      ...formData, 
                      menu: { ...formData.menu, [day]: e.target.value }
                    })}
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-sm"
                    placeholder={`Menu for ${day}...`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Meal Plans */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="p-2 bg-green-100 text-green-600 rounded-lg text-lg">🍱</span>
                Meal Plans
              </h2>
              <button 
                type="button"
                onClick={addMealPlan}
                className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-bold hover:bg-green-100"
              >
                + Add Plan
              </button>
            </div>
            <div className="space-y-4">
              {mealPlans.map((plan, index) => (
                <div key={index} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                  <button 
                    type="button"
                    onClick={() => removeMealPlan(index)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Plan Name</label>
                      <input 
                        type="text" 
                        value={plan.name}
                        onChange={e => updateMealPlan(index, 'name', e.target.value)}
                        className="w-full bg-white border-none rounded-lg p-2 text-sm"
                        placeholder="e.g. Monthly Lunch"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Price (₹)</label>
                      <input 
                        type="number" 
                        value={plan.price}
                        onChange={e => updateMealPlan(index, 'price', e.target.value)}
                        className="w-full bg-white border-none rounded-lg p-2 text-sm"
                        placeholder="3000"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Description</label>
                      <input 
                        type="text" 
                        value={plan.description}
                        onChange={updateMealPlan.bind(null, index, 'description')}
                        className="w-full bg-white border-none rounded-lg p-2 text-sm"
                        placeholder="e.g. Veg Thali with 4 Rotis, Rice, Dal, Sabzi"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {mealPlans.length === 0 && (
                <p className="text-center text-slate-400 py-4 italic">No meal plans added yet.</p>
              )}
            </div>
          </section>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-xl hover:bg-primary transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Service Profile'}
          </button>
        </form>
      </main>
    </div>
  );
}
