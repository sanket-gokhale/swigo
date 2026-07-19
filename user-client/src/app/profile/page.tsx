'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getUser, getProfile, updateProfile } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const cities = [
  'Nagpur', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad',
  'Nashik', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Indore', 'Bhopal', 'Jaipur', 'Lucknow', 'Kanpur',
  'Surat', 'Vadodara', 'Rajkot', 'Coimbatore', 'Kochi', 'Visakhapatnam', 'Vijayawada', 'Mysuru',
  'Chandigarh', 'Bhubaneswar', 'Patna', 'Guwahati'
];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const localUser = getUser();
      if (!localUser) {
        router.push('/login');
        return;
      }
      
      const userData = await getProfile() || localUser;
      setUser(userData);
      setName(userData.name || '');
      setPhone(userData.phone || '');
      setCity(userData.city || '');
      setBio(userData.bio || '');
      setLoading(false);
    };
    init();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving changes...');
    try {
      const updatedUser = await updateProfile({ name, phone, city, bio });
      setUser(updatedUser);
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-24">
        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-16 tracking-tight">Account Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Avatar Section */}
          <div className="flex flex-col items-start gap-8">
            <div className="h-64 w-64 rounded-[3rem] bg-white border border-slate-100 flex items-center justify-center text-8xl text-primary shadow-2xl shadow-slate-200/50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
              {user?.name?.charAt(0)}
            </div>
            <button className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              Change Photo
            </button>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="Full Name" value={name || ''} onChange={(e) => setName(e.target.value)} />
              <InputGroup label="Email Address" value={user?.email || ''} readOnly />
              <InputGroup label="Phone Number" value={phone || ''} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              
              {/* City Select Group */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">Current City</label>
                <div className="relative">
                  <select 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                    required
                  >
                    <option value="" disabled>-- Select City (Required) --</option>
                    {cities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">About You</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-sm font-medium dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[160px]"
                placeholder="Tell others about yourself..."
              />
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white px-10 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={() => router.back()}
                className="bg-slate-200 text-slate-700 px-10 py-4 rounded-2xl text-sm font-bold hover:bg-slate-300 transition-all dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InputGroup({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  readOnly = false 
}: { 
  label: string; 
  value: string; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean 
}) {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 ml-1">{label}</label>
      <input 
        type="text" 
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all ${readOnly ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      />
    </div>
  );
}


