'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout, getUser, getProfile } from '../../services/auth.service';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [auth, setAuth] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // System status widget states
  const [statusOpen, setStatusOpen] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, 'checking' | 'online' | 'offline'>>({
    user: 'checking',
    owner: 'checking',
    admin: 'checking',
    tiffin: 'checking',
    server: 'checking'
  });

  const checkAllPortals = async () => {
    const targets = [
      { key: 'user', url: 'http://localhost:3000' },
      { key: 'owner', url: 'http://localhost:3001' },
      { key: 'admin', url: 'http://localhost:3002' },
      { key: 'tiffin', url: 'http://localhost:3003' },
      { key: 'server', url: 'http://localhost:5000' }
    ];
    
    setStatuses({
      user: 'checking',
      owner: 'checking',
      admin: 'checking',
      tiffin: 'checking',
      server: 'checking'
    });
    
    for (const target of targets) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        await fetch(target.url, { mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeoutId);
        setStatuses(prev => ({ ...prev, [target.key]: 'online' }));
      } catch (err) {
        setStatuses(prev => ({ ...prev, [target.key]: 'offline' }));
      }
    }
  };

  useEffect(() => {
    if (statusOpen) {
      checkAllPortals();
    }
  }, [statusOpen]);

  useEffect(() => {
    setMounted(true);
    const initAuth = async () => {
      const isAuthed = isAuthenticated();
      setAuth(isAuthed);
      if (isAuthed) {
        // Set local data first for speed
        setUser(getUser());
        
        // Refresh from database
        const latestUser = await getProfile();
        if (latestUser) setUser(latestUser);
        
        // Get location
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => {
              console.warn('Geolocation error in Navbar:', error.message);
            },
            {
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 300000
            }
          );
        }
      }
    };

    initAuth();
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'owner') return '/owner/dashboard';
    return '/dashboard';
  };

  const handleLogout = () => {
    logout();
    setAuth(false);
    router.push('/');
  };

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Swigo</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Swigo</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {/* Portal Status Popover */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-all border border-transparent cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Portal Status
              </button>

              {statusOpen && (
                <div className="absolute left-0 mt-3 w-64 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl z-50 dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3 dark:border-zinc-800">
                    <h5 className="text-xs font-black uppercase tracking-wider text-zinc-400">Subsystem Gateway Status</h5>
                    <button onClick={() => checkAllPortals()} className="text-[10px] font-bold text-primary hover:underline cursor-pointer">
                      Refresh
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { key: 'user', label: 'User Client Portal' },
                      { key: 'owner', label: 'Owner Client Portal' },
                      { key: 'admin', label: 'Admin Client Portal' },
                      { key: 'tiffin', label: 'Tiffin Client Portal' },
                      { key: 'server', label: 'Backend Express API' }
                    ].map(sub => (
                      <div key={sub.key} className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-600 dark:text-zinc-300">{sub.label}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold ${
                          statuses[sub.key] === 'online' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' :
                          statuses[sub.key] === 'offline' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            statuses[sub.key] === 'online' ? 'bg-emerald-500 animate-pulse' :
                            statuses[sub.key] === 'offline' ? 'bg-rose-500' : 'bg-zinc-400'
                          }`} />
                          {statuses[sub.key]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {auth ? (
            <div className="relative flex items-center gap-4">
              {/* User Info (Desktop) */}
              <div className="hidden lg:flex flex-col items-end text-xs text-zinc-500">
                <span className="font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</span>
                <span className="text-[10px] opacity-70">{user?.email}</span>
                {location && (
                  <span className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    📍 {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Avatar / Profile Dropdown Trigger */}
              <div className="group relative">
                <button 
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-transparent transition-all group-hover:ring-primary/20"
                >
                  <span className="text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 origin-top-right translate-y-2 scale-95 opacity-0 invisible transition-all group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:visible">
                  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="border-b border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{user?.name}</p>
                      <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link 
                        href={getDashboardLink()} 
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        <span>📊</span> Dashboard
                      </Link>
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        <span>⚙️</span> Control Hub Settings
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/signup"
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
