'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { logout, getUser } from '@/services/auth.service';

export default function SettingsPage() {
  useEffect(() => {
    if (!getUser()) {
      window.location.href = '/login?redirect=/settings';
    }
  }, []);
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-12">
          Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Account Controls</h2>
            <p className="text-sm text-zinc-500">Manage your password and security settings.</p>
          </div>

          <div className="md:col-span-2 space-y-8">
            <SettingCard 
              title="Change Password" 
              description="Update your password to keep your account secure."
              action={<button className="text-sm font-bold text-primary hover:underline">Update →</button>}
            />
            <SettingCard 
              title="Two-Factor Authentication" 
              description="Add an extra layer of security to your account."
              action={<button className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">Enable</button>}
            />
            <SettingCard 
              title="Privacy Settings" 
              description="Control who can see your activity and profile."
              action={<button className="text-sm font-bold text-primary hover:underline">Manage →</button>}
            />
            
            <div className="pt-8">
              <button 
                onClick={handleLogout}
                className="w-full p-6 rounded-[32px] border-2 border-dashed border-red-200 text-red-600 font-bold hover:bg-red-50 transition-all dark:border-red-900/30 dark:hover:bg-red-950/20"
              >
                🚪 Logout of all devices
              </button>
            </div>

            <div className="pt-4">
              <button className="text-sm font-bold text-zinc-400 hover:text-red-500 transition-colors">
                Permanently delete account
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function SettingCard({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="p-8 rounded-[32px] bg-white border border-zinc-100 shadow-sm flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800">
      <div className="flex-1 mr-8">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 mb-1">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{description}</p>
      </div>
      {action}
    </div>
  );
}
