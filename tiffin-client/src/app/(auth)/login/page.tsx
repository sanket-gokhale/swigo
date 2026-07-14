'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, logout } from '@/services/auth.service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      const user = response.data.user;
      
      if (user?.role === 'tiffin' || user?.role === 'admin') {
        router.push('/dashboard');
      } else {
        logout();
        setError('Unauthorized: This portal is for Tiffin Providers only.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 transition-transform hover:scale-105">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-primary/20">S</div>
            <span className="text-3xl font-black tracking-tighter text-slate-800">Swigo</span>
          </Link>
          <h2 className="mt-10 text-4xl font-extrabold tracking-tight text-slate-800">
            Tiffin Provider Portal
          </h2>
          <p className="mt-3 text-slate-500 font-medium">
            Manage your kitchen and orders
          </p>
        </div>

        <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl bg-secondary/10 p-4 text-sm font-bold text-secondary text-center border border-secondary/20">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <label htmlFor="email-address" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Provider Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-clean"
                  placeholder="chef@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" title="Password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Secret Key
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-clean"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm font-bold text-slate-500 cursor-pointer">
                  Stay logged in
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" title="Forgot Password" className="font-bold text-primary hover:text-primary/80 transition-colors">
                  Forgot key?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-5 text-base"
            >
              {loading ? 'Entering Kitchen...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-200/50 text-center">
            <p className="text-sm font-bold text-slate-500">
              Want to join Swigo?{' '}
              <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors">
                Apply as provider
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
