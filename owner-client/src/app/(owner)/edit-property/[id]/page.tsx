'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchPropertyById, updateProperty } from '@/services/property.service';
import toast from 'react-hot-toast';

export default function EditPropertyPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    area: '',
    address: '',
    pincode: '',
    price: '',
    type: 'PG',
    contactNumber: '',
    amenities: '',
    genderPreference: 'Mixed',
    electricityBill: 'Unpaid',
    waterSupplyTime: '24/7',
    waterBill: 'Included',
    maintenance: 'Included',
  });
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success('Location updated successfully!');
      }, (err) => {
        toast.error('Failed to get location.');
      });
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

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const p = await fetchPropertyById(id as string) as any;
        if (p) {
          setFormData({
            title: p.title || '',
            description: p.description || '',
            city: p.city || '',
            area: p.area || '',
            address: p.address || '',
            pincode: p.pincode || '',
            price: String(p.price || 0),
            type: p.type || 'PG',
            contactNumber: p.contactNumber || '',
            amenities: (p.amenities || []).join(', '),
            genderPreference: p.genderPreference || 'Mixed',
            electricityBill: p.electricityBill || 'Unpaid',
            waterSupplyTime: p.waterSupplyTime || '24/7',
            waterBill: p.waterBill || 'Included',
            maintenance: p.maintenance || 'Included',
          });
          if (p.coordinates) {
            setCoords({
              lng: p.coordinates.coordinates[0],
              lat: p.coordinates.coordinates[1]
            });
          }
        }
      } catch (err) {
        toast.error('Error fetching property data');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProperty(id as string, {
        ...formData,
        location: `${formData.area}, ${formData.city}`,
        coordinates: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        },
        price: Number(formData.price),
        amenities: formData.amenities.split(',').map(a => a.trim())
      });

      toast.success('Property updated successfully!');
      router.push('/properties');
    } catch (err) {
      toast.error('Error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4 h-96 bg-zinc-50 rounded-3xl dark:bg-zinc-900" />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Edit Listing</h1>
        <p className="mt-2 text-zinc-500">Update the details for your property listing.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Property Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Property Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              >
                <option value="PG">PG</option>
                <option value="Flat">Flat</option>
                <option value="Homestay">Homestay</option>
                <option value="Hostel">Hostel</option>
                <option value="Room">Room (Commercial/Business)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Price (per month)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Gender Preference</label>
              <select
                value={formData.genderPreference}
                onChange={(e) => setFormData({...formData, genderPreference: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Electricity Bill</label>
              <select
                value={formData.electricityBill}
                onChange={(e) => setFormData({...formData, electricityBill: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Water Supply Time</label>
              <input
                type="text"
                value={formData.waterSupplyTime}
                onChange={(e) => setFormData({...formData, waterSupplyTime: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                placeholder="e.g. 24/7 or 6AM - 10PM"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Water Bill</label>
              <input
                type="text"
                value={formData.waterBill}
                onChange={(e) => setFormData({...formData, waterBill: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                placeholder="e.g. Included or ₹200/month"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Maintenance</label>
              <select
                value={formData.maintenance}
                onChange={(e) => setFormData({...formData, maintenance: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              >
                <option value="Included">Included</option>
                <option value="Not Included">Not Included</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contact Number</label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">City *</label>
              <select
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm font-bold"
              >
                <option value="" disabled>-- Select City (Required) --</option>
                {['Pune', 'Mumbai', 'Nagpur', 'Delhi', 'Noida', 'Gurugram', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Nashik', 'Chhatrapati Sambhajinagar', 'Indore', 'Bhopal', 'Jaipur', 'Lucknow', 'Surat', 'Vadodara', 'Coimbatore', 'Kochi', 'Visakhapatnam', 'Chandigarh'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Area / Locality</label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Full Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Pin Code</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">Set Coordinates Option</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={getLocation}
                  className="h-[46px] rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200"
                >
                  📍 GPS Location
                </button>
                <button
                  type="button"
                  onClick={getCoordinatesFromAddress}
                  className="h-[46px] rounded-xl bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center justify-center gap-1.5"
                >
                  🔍 Address Location
                </button>
              </div>
              { (coords.lat !== 0 || coords.lng !== 0) && (
                <p className="text-[10px] font-medium text-emerald-500 mt-1">
                  ✓ Coordinates pinned: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Amenities (comma separated)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-xl border border-zinc-200 py-4 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-[2] rounded-xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-95"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
