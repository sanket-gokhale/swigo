'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, logout, isAuthenticated } from '../../services/auth.service';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated()) {
      const authUser = getUser();
      if (authUser && authUser.role !== 'user' && authUser.role !== 'admin') {
        logout();
        router.push('/login?error=Unauthorized access');
        return;
      }
      setUser(authUser);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Stays', path: '/search' },
    { name: 'Food', path: '/food' },
    { name: 'Requests', path: '/requests' },
    { name: 'Saved', path: '/saved' },
  ];

  const mobileLinks = [
    { 
      name: 'Home', 
      path: '/dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      )
    },
    { 
      name: 'Stays', 
      path: '/search', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      )
    },
    { 
      name: 'Food', 
      path: '/food', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z"/><path d="M2 14h20"/><path d="M12 3v-1"/></svg>
      )
    },
    { 
      name: 'Saved', 
      path: '/saved', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      )
    },
    { 
      name: 'Account', 
      path: '/profile', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      )
    },
  ];

  if (!mounted) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-100/80 transition-all h-20 flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          <div className="flex items-center gap-12 lg:gap-16">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <img src="/logo.svg" alt="Swigo Logo" className="h-9 w-9 sm:h-10 sm:w-10 object-contain group-hover:scale-105 transition-transform" />
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Swigo</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.path || (link.path !== '/dashboard' && link.path !== '/' && pathname?.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={`text-sm font-bold transition-all px-4 py-2 rounded-xl ${
                      isActive 
                      ? 'text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-500/5' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <Link href="/profile" className="flex items-center gap-2.5 p-1 pr-3.5 bg-slate-100/60 rounded-2xl hover:bg-slate-100 transition-all">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-md shadow-blue-500/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-xs sm:text-sm font-bold text-slate-700">{user.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-xs sm:text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors px-2 py-1">Log in</Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-white/95 backdrop-blur-2xl md:hidden rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-300/40 py-2 px-3">
        <div className="flex items-center justify-between">
          {mobileLinks.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && item.path !== '/' && pathname?.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-1 transition-all py-1 px-2.5 rounded-xl ${
                  isActive ? 'text-blue-600 scale-105 font-extrabold' : 'text-slate-400 hover:text-slate-600 font-semibold'
                }`}
              >
                {item.icon}
                <span className="text-[10px] tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
