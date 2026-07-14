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
            <Link href="/" className="text-2xl font-black tracking-tighter uppercase">
              Swigo
            </Link>
            <p className="text-zinc-400 text-sm font-bold leading-relaxed max-w-xs">
              Providing premium stays and tiffin services with the speed and reliability you expect.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">Company</h4>
            <ul className="space-y-4">
              {['About us', 'Our offerings', 'Newsroom', 'Investors', 'Blog', 'Careers'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">Travel</h4>
            <ul className="space-y-4">
              {['Ride', 'Drive', 'Eat', 'Stays', 'Business', 'Tiffins'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Safety', 'Terms', 'Privacy'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-zinc-800 gap-8">
          <div className="flex gap-8">
            {mounted && ['𝕏', '📸', '📘', '💼'].map(social => (
              <button key={social} className="text-xl text-zinc-500 hover:text-white transition-colors">
                {social}
              </button>
            ))}
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>© 2024 Swigo Technologies Inc.</span>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
