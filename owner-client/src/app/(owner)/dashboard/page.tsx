'use client';
import React, { useEffect, useState } from 'react';
import { getUser } from '@/services/auth.service';
import { getAuthJSON } from '@/services/api';

interface Stats {
  totalProperties: number;
  totalRequests: number;
  pendingRequests: number;
  averageRating: number;
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAuthJSON('/properties/owner/stats');
        setStats(data.data || data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-20 bg-zinc-100 rounded-3xl w-2/3 sm:w-1/3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-3xl" />)}
    </div>
  </div>;

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Welcome Section */}
      <section>
        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3 sm:mb-4">Owner Dashboard</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
          Welcome back, {user?.name.split(' ')[0]}! 👋
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
          Here's what's happening with your properties today.
        </p>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Properties" value={stats?.totalProperties || 0} icon="🏠" color="green" />
        <StatCard title="Total Requests" value={stats?.totalRequests || 0} icon="📅" color="green" />
        <StatCard title="Pending Requests" value={stats?.pendingRequests || 0} icon="⏳" color="red" />
        <StatCard title="Average Rating" value={stats?.averageRating || 0} icon="⭐" color="green" suffix="/ 5.0" />
      </section>

      {/* Quick Overview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card-modern p-6 sm:p-10 min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-white/5 flex items-center justify-center text-3xl sm:text-5xl mb-6 shadow-2xl">📈</div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Performance Insights</h3>
            <p className="text-slate-400 max-w-sm mt-3 text-sm sm:text-base font-medium">Detailed occupancy and revenue charts will appear here as your data grows.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card-modern p-6 sm:p-10">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Action Needed
            </h3>
            {stats?.pendingRequests && stats.pendingRequests > 0 ? (
              <div className="space-y-4">
                <div className="p-5 sm:p-6 rounded-[2rem] bg-white/5 border border-white/10 group hover:bg-primary/10 transition-all">
                  <p className="text-sm font-bold text-white">
                    You have {stats.pendingRequests} pending booking requests.
                  </p>
                  <button className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all">
                    Review Now <span>→</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-500">All caught up! No pending requests.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, suffix = "" }: { title: string; value: number | string; icon: string; color: string; suffix?: string }) {
  const isPrimary = color === 'green';

  return (
    <div className="card-modern p-6 sm:p-8 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 text-7xl opacity-[0.03] transition-transform group-hover:scale-110 group-hover:-rotate-12">{icon}</div>
      <div className={`inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${isPrimary ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'} text-xl sm:text-2xl mb-4 sm:mb-6`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="mt-2 sm:mt-3 text-3xl sm:text-4xl font-black text-white">
          {value} <span className="text-xs sm:text-sm font-bold text-slate-500">{suffix}</span>
        </p>
      </div>
    </div>
  );
}

