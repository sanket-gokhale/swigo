'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProperty } from '@/services/property.service';
import { getAuthJSON } from '@/services/api';
import toast from 'react-hot-toast';

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    hasFoodService: false,
    linkedTiffinService: '',
    foodCharges: '',
    foodType: 'Both',
  });
  const [tiffinProviders, setTiffinProviders] = useState<any[]>([]);
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...selectedFiles].slice(0, 5));
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const fetchTiffinProviders = async (city: string) => {
    if (!city) return;
    try {
      const envelope = await getAuthJSON(`/tiffins?city=${city}&type=owner-collab`);
      const data = envelope.data || envelope;
      setTiffinProviders(data);
    } catch (err) {
      console.error('Failed to fetch tiffin providers');
    }
  };

  React.useEffect(() => {
    if (formData.city) {
      fetchTiffinProviders(formData.city);
    }
  }, [formData.city]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amenitiesArray = formData.amenities.split(',').map(item => item.trim()).filter(item => item !== '');
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('city', formData.city);
      data.append('area', formData.area);
      data.append('address', formData.address);
      data.append('pincode', formData.pincode);
      data.append('location', `${formData.area}, ${formData.city}`); // Summary
      
      // Add coordinates as JSON
      data.append('coordinates[type]', 'Point');
      data.append('coordinates[coordinates][0]', coords.lng.toString());
      data.append('coordinates[coordinates][1]', coords.lat.toString());

      data.append('price', formData.price);
      data.append('type', formData.type);
      data.append('contactNumber', formData.contactNumber);
      data.append('genderPreference', formData.genderPreference);
      data.append('electricityBill', formData.electricityBill);
      data.append('waterSupplyTime', formData.waterSupplyTime);
      data.append('waterBill', formData.waterBill);
      data.append('maintenance', formData.maintenance);
      
      amenitiesArray.forEach(amenity => {
        data.append('amenities', amenity);
      });
      
      images.forEach(image => {
        data.append('images', image);
      });

      data.append('hasFoodService', formData.hasFoodService.toString());
      if (formData.hasFoodService) {
        data.append('linkedTiffinService', formData.linkedTiffinService);
        data.append('foodCharges', formData.foodCharges);
        data.append('foodType', formData.foodType);
      }

      await createProperty(data);
      toast.success('Property listed successfully!');
      router.push('/properties');
    } catch (err: any) {
      toast.error(err.message || 'Error adding property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Add New Listing</h1>
        <p className="mt-2 text-zinc-500">Fill in the details to list your property on Swigo.</p>
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
              placeholder="e.g. Premium Men's PG near Sector 62"
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
                placeholder="₹8500"
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
                placeholder="e.g. +91 9876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                placeholder="e.g. Noida"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Area / Locality</label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                placeholder="e.g. Sector 62"
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
              placeholder="House No, Building, Street..."
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
                placeholder="201301"
              />
            </div>
            <button
              type="button"
              onClick={getLocation}
              className="h-[46px] rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
            >
              📍 Pin Exact Location
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Amenities (comma separated)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              placeholder="WiFi, AC, Laundry, Meals"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Property Images (Max 5)</label>
            <div className="mt-2 grid grid-cols-5 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={preview} alt="preview" className="object-cover w-full h-full" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  <span className="text-2xl text-zinc-400">+</span>
                  <span className="text-[10px] text-zinc-400 mt-1">Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
              placeholder="Tell tenants what makes your property great..."
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Food Service</h3>
                <p className="text-sm text-zinc-500">Enable tiffin service for your property</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, hasFoodService: !formData.hasFoodService})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.hasFoodService ? 'bg-primary' : 'bg-zinc-200 dark:bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasFoodService ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {formData.hasFoodService && (
              <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Tiffin Provider</label>
                    <select
                      value={formData.linkedTiffinService}
                      onChange={(e) => setFormData({...formData, linkedTiffinService: e.target.value})}
                      className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                    >
                      <option value="">Select a provider</option>
                      {tiffinProviders.map((provider) => (
                        <option key={provider._id} value={provider._id}>{provider.name} ({provider.area})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Food Type</label>
                    <select
                      value={formData.foodType}
                      onChange={(e) => setFormData({...formData, foodType: e.target.value})}
                      className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                    >
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Monthly Food Charges (Approx)</label>
                  <input
                    type="number"
                    value={formData.foodCharges}
                    onChange={(e) => setFormData({...formData, foodCharges: e.target.value})}
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                    placeholder="e.g. 3000"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-zinc-900 py-4 text-lg font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-xl shadow-zinc-200 dark:shadow-none"
        >
          {loading ? 'Listing Property...' : 'List Property'}
        </button>
      </form>
    </div>
  );
}
