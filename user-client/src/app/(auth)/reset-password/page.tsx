'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/services/auth.service';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await resetPassword(token, newPassword);
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Enter your reset token and your new password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-950/30 dark:text-green-400">
              {message}
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Reset Token
              </label>
              <input
                id="token"
                name="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 sm:text-sm"
                placeholder="Enter the token here"
              />
            </div>
            <div>
              <label htmlFor="new-password" title="New Password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                New Password
              </label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
