'use client';
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-black text-white py-12 px-6 border-t border-zinc-800 mt-auto">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link href="/dashboard" className="inline-flex items-center gap-3">
              <img src="/logo.svg" alt="Swigo Logo" className="h-9 w-9 object-contain rounded-full bg-white/10 p-0.5" />
              <span className="text-2xl font-black tracking-tighter uppercase text-white">Swigo Owner</span>
            </Link>
            <p className="text-zinc-400 text-sm font-bold leading-relaxed max-w-xs">
              Empowering property owners with high occupancy, seamless booking management, and direct tenant communication.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Owner Portal</h4>
            <ul className="space-y-3">
              {[
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'My Properties', path: '/properties' },
                { name: 'Add Listing', path: '/add-property' },
                { name: 'Bookings & Requests', path: '/requests' },
                { name: 'Partnerships', path: '/collabs' },
              ].map(item => (
                <li key={item.name}>
                  <Link href={item.path} className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Swigo Ecosystem</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://swigo-owner-client.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  Property Owner Portal
                </a>
              </li>
              <li>
                <a 
                  href="https://swigo-tiffin-client.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  Tiffin Kitchen Portal
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Support &amp; Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:swigo.official@gmail.com" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                  Help Center (swigo.official@gmail.com)
                </a>
              </li>
              {['Safety', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <span className="text-sm font-bold text-zinc-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-zinc-800 gap-6">
          <div className="flex gap-6 text-sm">
            {mounted && ['𝕏', '📸', '📘', '💼'].map(social => (
              <span key={social} className="text-zinc-500 cursor-pointer hover:text-white transition-colors">
                {social}
              </span>
            ))}
          </div>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>© 2026 Swigo Technologies Inc (appflux.tech). All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
