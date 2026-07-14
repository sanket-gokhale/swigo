'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout, getUser, getProfile } from '../../services/auth.service';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [auth, setAuth] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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
            <Link href="/find-properties" className="text-sm font-medium text-zinc-600 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">
              Find Properties
            </Link>
            <Link href="/requests" className="text-sm font-medium text-zinc-600 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">
              Food Requests
            </Link>
            <Link href="/collabs" className="text-sm font-medium text-zinc-600 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors">
              Partnerships
            </Link>
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
                        href="/user/profile"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-800"
                      >
                        <span>👤</span> Profile Settings
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
