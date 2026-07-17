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
    { name: 'Food 🍱', path: '/food' },
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
      name: 'Search', 
      path: '/search', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all h-20 flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-16">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-primary/30 group-hover:rotate-12 transition-all">
                S
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">Swigo</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-bold transition-all px-5 py-2.5 rounded-xl ${
                    pathname === link.path 
                    ? 'text-primary bg-primary/10 shadow-sm shadow-primary/5' 
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                <Link href="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-slate-100/50 rounded-2xl hover:bg-slate-100 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-xs font-black text-white shadow-lg shadow-primary/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-slate-700">{user.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-sm font-bold text-secondary hover:underline underline-offset-4"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Log in</Link>
                <Link 
                  href="/signup" 
                  className="btn-primary"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-white/90 backdrop-blur-2xl md:hidden rounded-3xl border border-slate-200/50 shadow-2xl shadow-slate-200/50 pb-safe">
        <div className="flex items-center justify-around h-16">
          {mobileLinks.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 transition-all ${
                pathname === item.path ? 'text-primary scale-110' : 'text-slate-500'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
