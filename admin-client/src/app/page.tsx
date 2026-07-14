'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser } from '../services/auth.service';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (isAuthenticated() && user?.role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
