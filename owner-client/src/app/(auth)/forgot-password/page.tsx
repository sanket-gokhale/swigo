'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/services/auth.service';
import toast from 'react-hot-toast';

export default function OwnerForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
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
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Swigo Owners</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Reset Owner Password
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {submitted ? "Check your email for the reset link" : "Enter your business email to receive a recovery link"}
          </p>
        </div>

        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <label htmlFor="email-address" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Business Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-primary focus:ring-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 sm:text-sm"
                placeholder="owner@example.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
