'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function AdminSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    // Form validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Force signup role as 'admin'
      const response = await register(name, email, password, 'admin');
      toast.success('Admin account created successfully!');
      
      const user = response.data?.user;
      if (user?.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary" />
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Swigo</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create Admin Account
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Register a new system administrator credentials
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Admin Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 transition-all focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                  placeholder="Administrator Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 transition-all focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                  placeholder="admin@swigo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 transition-all focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 px-4 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 hover:shadow-lg disabled:opacity-50 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {loading ? 'Creating account...' : 'Sign Up as Admin'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an admin account?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
