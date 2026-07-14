'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, getUser, logout } from '@/services/auth.service';
import { useLocation } from '@/context/LocationContext';
import toast from 'react-hot-toast';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { location } = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const authUser = getUser();
      if (!isAuthenticated() || !authUser) {
        router.push('/login?redirect=' + pathname);
        return;
      }

      if (authUser.role !== 'owner' && authUser.role !== 'admin') {
        toast.error('Unauthorized: Owner access only');
        router.push('/login');
        return;
      }

      setUser(authUser);
      setLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  // Close sidebar on page change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'My Properties', href: '/properties', icon: '🏠' },
    { name: 'Add Property', href: '/add-property', icon: '➕' },
    { name: 'Bookings', href: '/requests', icon: '📅' },
    { name: 'Partnerships', href: '/collabs', icon: '🤝' },
    { name: 'Reviews', href: '/reviews', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-white flex font-sans relative overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-100 bg-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">S</div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Swigo <span className="text-primary">Owner</span></span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className={`text-lg ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-4 px-4 py-3 mb-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-secondary hover:bg-secondary/10 transition-all"
          >
            <span className="text-lg">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto w-full flex flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-xl px-4 py-4 md:px-10 md:py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg lg:hidden hover:bg-slate-100 transition-all"
            >
              ☰
            </button>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-800">
              {navItems.find(i => i.href === pathname)?.name || 'Owner Panel'}
            </h2>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            {location && (
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 max-w-[180px] md:max-w-[250px]" title={location.address}>
                <span className="text-primary">📍</span>
                <span className="text-[11px] font-bold text-slate-500 truncate">
                  {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                </span>
              </div>
            )}
            <button className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg md:text-xl hover:bg-slate-100 transition-all">🔔</button>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-10 max-w-[1600px] mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

