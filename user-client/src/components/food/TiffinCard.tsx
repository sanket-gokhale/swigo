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
    <div className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem]">
        <img 
          src={tiffin.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} 
          alt={tiffin.name} 
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
            ⭐ 4.8
          </span>
          <span className="bg-primary/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
            Veg / Non-Veg
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
              {tiffin.name}
            </h3>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1">
              📍 {tiffin.area}, {tiffin.city}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-400">Starts at</p>
            <p className="text-2xl font-black text-slate-900 leading-none">₹{tiffin.price}</p>
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

        <div className="flex gap-3">
          <Link 
            href={`/food/${tiffin._id}`}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold text-center transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-200"
          >
            View Menu
          </Link>
          <button className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all">
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
