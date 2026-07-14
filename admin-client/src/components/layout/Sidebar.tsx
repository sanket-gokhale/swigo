import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface SidebarProps {
  currentTab: string;
}

export default function Sidebar({ currentTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'portals', name: 'Portal Control Hub', icon: '🌐' },
    { id: 'users', name: 'User Management', icon: '👤' },
    { id: 'owners', name: 'Owner Management', icon: '🏢' },
    { id: 'tiffins', name: 'Tiffin Providers', icon: '🍱' },
    { id: 'properties', name: 'Properties', icon: '🏠' },
    { id: 'rooms', name: 'Room Management', icon: '🛏️' },
    { id: 'bookings', name: 'Bookings', icon: '📅' },
    { id: 'food', name: 'Food Management', icon: '🍽️' },
    { id: 'collabs', name: 'Collaborations', icon: '🤝' },
    { id: 'reviews', name: 'Reviews', icon: '⭐' },
    { id: 'reports', name: 'Reports & Analytics', icon: '📈' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'support', name: 'Support Center', icon: '🎧' },
    { id: 'settings', name: 'System Settings', icon: '⚙️' },
    { id: 'profile', name: 'Profile Settings', icon: '🛡️' }
  ];

  return (
    <aside className="w-80 border-r border-slate-100 bg-slate-50/50 p-6 flex flex-col gap-8 shrink-0 min-h-[calc(100vh-73px)]">
      <div>
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin Controls</p>
        <nav className="mt-4 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                href={`/dashboard?tab=${item.id}`}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto border-t border-slate-100 pt-6">
        <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
          <p className="text-xs font-bold text-primary">System Online</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">All subsystems operational. Database synced.</p>
        </div>
      </div>
    </aside>
  );
}
