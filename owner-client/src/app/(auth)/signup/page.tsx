'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function OwnerSignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Force role as 'owner'
      await register(name, email, password, 'owner');
      toast.success('Property Owner account created!');
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
            <div className="h-10 w-10 rounded-xl bg-primary shadow-lg shadow-primary/20" />
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Swigo</span>
          </Link>
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Property Owners
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create an account to start managing your listings
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Owner Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 transition-all focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Business Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-900 transition-all focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-50 sm:text-sm"
                  placeholder="owner@example.com"
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
                {loading ? 'Registering...' : 'Sign Up as Owner'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an owner account?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
