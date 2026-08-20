'use client';

import React from 'react';
import Link from 'next/link';
import { Property } from '../../types/property';

export default function PropertyCard({ property }: { property: Property }) {
  const propertyImage = property.images?.[0] || '/hostel.jpeg';
  const typeBadgeColors: Record<string, string> = {
    Hostel: 'bg-blue-50 text-blue-600 border-blue-100',
    PG: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Flat: 'bg-orange-50 text-orange-600 border-orange-100',
    Room: 'bg-purple-50 text-purple-600 border-purple-100',
    Homestay: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  const badgeClass = typeBadgeColors[property.type] || 'bg-blue-50 text-blue-600 border-blue-100';

  return (
    <Link href={`/property/${property._id}`} className="group block h-full">
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100">
          <img 
            src={propertyImage} 
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${badgeClass}`}>
              {property.type}
            </div>
            {property.genderPreference && (
              <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-100">
                {property.genderPreference}
              </div>
            )}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold shadow-md">
            ₹{property.price?.toLocaleString() || 0}<span className="text-[10px] font-normal text-slate-200">/mo</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0 justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1 text-slate-500 text-xs font-medium truncate">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-600 shrink-0">
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate">{property.location || property.city || 'Nagpur'}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold shrink-0">
                <span>⭐</span>
                <span>{property.averageRating ? property.averageRating.toFixed(1) : '4.8'}</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              {property.title}
            </h3>

            {property.address && (
              <p className="text-xs text-slate-400 mt-1 truncate">
                {[property.address, property.area].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-500">
              <span>{property.electricityBill === 'Paid' ? '⚡ Electricity included' : '⚡ Metered power'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
              <span>Details</span>
              <span>→</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}

