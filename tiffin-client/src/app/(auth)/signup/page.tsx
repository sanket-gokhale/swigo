'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function TiffinSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Force role as 'tiffin'
      await register(name, email, password, 'tiffin');
      toast.success('Tiffin Provider account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-orange-500" />
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Swigo Tiffins</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Start your Tiffin service
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Reach students and professionals looking for home-cooked food
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Provider Name / Business Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 sm:text-sm"
                placeholder="Mom's Kitchen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Business Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 sm:text-sm"
                placeholder="kitchen@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-orange-500 focus:ring-orange-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Provider Account'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-orange-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
