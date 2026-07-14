'use client';
import React, { useState } from 'react';
import { useAuthModal } from '../../context/AuthModalContext';
import { login, register } from '../../services/auth.service';

export default function AuthModal() {
  const { isOpen, closeModal, onSuccessAction } = useAuthModal();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      
      closeModal();
      if (onSuccessAction) onSuccessAction();
      window.location.reload(); // Refresh to update all components
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300 rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button 
            onClick={closeModal}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none focus:ring-2 focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none focus:ring-2 focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 outline-none focus:ring-2 focus:ring-primary dark:border-zinc-800 dark:bg-zinc-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-primary hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}
