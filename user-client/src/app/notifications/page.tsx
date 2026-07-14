'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getUser } from '@/services/auth.service';

export default function NotificationsPage() {
  useEffect(() => {
    if (!getUser()) {
      window.location.href = '/login?redirect=/notifications';
    }
  }, []);
  const notifications = [
    { id: 1, title: 'Booking Accepted', message: 'Your request for Green Valley PG has been accepted by the owner.', time: '2 hours ago', icon: '✅', color: 'bg-green-50 text-green-600' },
    { id: 2, title: 'New Message', message: 'The host of City Stay has replied to your review.', time: '5 hours ago', icon: '💬', color: 'bg-blue-50 text-blue-600' },
    { id: 3, title: 'Payment Reminder', message: 'Your monthly stay payment is due in 3 days.', time: '1 day ago', icon: '💳', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black">
      <Navbar />
      
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Notifications
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Stay updated with your latest activity.</p>
          </div>
          <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Mark all as read</button>
        </div>

        <div className="space-y-4">
          {notifications.map(notif => (
            <div key={notif.id} className="p-6 rounded-[32px] bg-white border border-zinc-100 shadow-sm flex gap-6 hover:shadow-md transition-all dark:bg-zinc-900 dark:border-zinc-800">
              <div className={`h-14 w-14 rounded-2xl ${notif.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                {notif.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{notif.title}</h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">{notif.time}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {notif.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="px-8 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:opacity-80 transition-all">
            Load Older Notifications
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
