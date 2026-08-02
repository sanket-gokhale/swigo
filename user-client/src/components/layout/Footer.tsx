'use client';
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-black text-white py-16 pb-32 md:pb-16 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <img src="/logo.svg" alt="Swigo Logo" className="h-9 w-9 object-contain rounded-full bg-white/10 p-0.5" />
              <span className="text-2xl font-black tracking-tighter uppercase text-white">Swigo</span>
            </Link>
            <p className="text-zinc-400 text-sm font-bold leading-relaxed max-w-xs">
              Providing premium stays and tiffin services with the speed and reliability you expect.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">Company</h4>
            <ul className="space-y-4">
              {[
                { name: 'About us', path: '/about' },
                { name: 'Blog', path: '/blog' },
                { name: 'Careers', path: '/careers' }
              ].map(item => (
                <li key={item.name}>
                  <Link href={item.path} className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 -mt-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2 relative z-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Services To Join Us!
            </h4>
            <ul className="space-y-3 relative z-10">
              <li>
                <a
                  href="https://swigo-owner-client.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex items-center justify-between text-sm font-bold text-zinc-100 bg-black/40 hover:bg-primary/10 px-4 py-3 rounded-xl transition-all border border-white/5 hover:border-primary/30"
                >
                  <span>Property</span>
                  <span className="opacity-0 group-hover/link:opacity-100 transform -translate-x-2 group-hover/link:translate-x-0 transition-all text-primary">→</span>
                </a>
              </li>
              <li>
                <a
                  href="https://swigo-tiffin-client.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex items-center justify-between text-sm font-bold text-zinc-100 bg-black/40 hover:bg-primary/10 px-4 py-3 rounded-xl transition-all border border-white/5 hover:border-primary/30"
                >
                  <span>Tiffins/Kitchens</span>
                  <span className="opacity-0 group-hover/link:opacity-100 transform -translate-x-2 group-hover/link:translate-x-0 transition-all text-primary">→</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">Support</h4>
            <ul className="space-y-4">
              {[
                { name: 'Help Center', path: '/help' },
                { name: 'Email Support (swigo.official@gmail.com)', path: 'mailto:swigo.official@gmail.com' },
                { name: 'Safety', path: '/safety' },
                { name: 'Terms', path: '/terms' },
                { name: 'Privacy', path: '/privacy' }
              ].map(item => (
                <li key={item.name}>
                  <Link href={item.path} className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-zinc-800 gap-8">
          <div className="flex gap-8">
            <a href="" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
            </a>
            <a href="https://www.instagram.com/swigo.official?igsh=MXVodDJwZXR2cW9qeg==" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
            </a>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>© 2026 Swigo Technologies Inc (appflux.tech).</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/help" className="hover:text-white transition-colors">Accessibility</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
