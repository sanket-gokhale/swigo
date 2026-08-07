'use client';

import React from 'react';
import Link from 'next/link';

interface TiffinCardProps {
  tiffin: {
    _id: string;
    name: string;
    description: string;
    city: string;
    area: string;
    price: number;
    images: string[];
    mealPlans: any[];
    menu: any;
  }
}

export default function TiffinCard({ tiffin }: TiffinCardProps) {
  return (
    <div className="group relative bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 p-3 md:p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 h-full flex flex-col">
      <div className="relative h-52 md:h-60 w-full shrink-0 overflow-hidden rounded-[1.2rem] md:rounded-[2rem]">
        <img 
          src={tiffin.images?.[0] || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%230f172a"/><circle cx="200" cy="120" r="45" fill="%23ff5a5f"/><text x="50%" y="82%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="14" font-weight="bold">Homely Tiffin Service</text></svg>'} 
          alt={tiffin.name} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 md:top-4 md:left-4 flex gap-1.5 md:gap-2">
          <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-lg">
            ⭐ 4.8
          </span>
          <span className="bg-primary/90 backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-lg">
            Veg / Non-Veg
          </span>
        </div>
      </div>

      <div className="p-3 md:p-6 flex flex-col flex-1">
        <div className="mb-4 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
              {tiffin.name}
            </h3>
            <p className="text-xs md:text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
              📍 {tiffin.area}, {tiffin.city}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs md:text-sm font-bold text-slate-400">Starts at</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 leading-none mt-0.5">₹{tiffin.price}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tiffin.mealPlans?.slice(0, 2).map((plan: any, i: number) => (
            <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100">
              {plan.name}
            </span>
          ))}
          {tiffin.mealPlans?.length > 2 && (
            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg">
              +{tiffin.mealPlans.length - 2} more
            </span>
          )}
        </div>

        <div className="flex gap-2 md:gap-3 mt-auto">
          <Link 
            href={`/food/${tiffin._id}`}
            className="flex-1 py-3 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl text-xs font-bold text-center transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-200"
          >
            View Menu
          </Link>
          <button className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-xl md:rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-xs md:text-sm">
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
