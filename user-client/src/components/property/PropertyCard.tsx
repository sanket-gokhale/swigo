'use client';

import React from 'react';
import Link from 'next/link';
import { Property } from '../../types/property';

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/property/${property._id}`} className="group block">
      <div className="card-modern overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[1.3/1] overflow-hidden rounded-[1.5rem] m-2">
          <img 
            src={property.images?.[0] || 'https://via.placeholder.com/400x300'} 
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {property.genderPreference === 'Girls' && (
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-secondary">
                Girls Only
              </div>
            )}
            <div className="bg-primary px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white">
              Verified
            </div>
          </div>
          <button className="absolute top-4 right-4 h-10 w-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-secondary transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-extrabold text-white truncate">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <p className="text-sm font-medium text-slate-400">{property.location}</p>
              </div>
              {property.rooms && property.rooms.length > 0 && (() => {
                const totalRooms = property.rooms.length;
                const availableRooms = property.rooms.filter((r: any) => r.availability === 'Available').length;
                return (
                  <div className="mt-2.5 flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-xl px-2.5 py-1 w-fit">
                    <span className={`h-1.5 w-1.5 rounded-full ${availableRooms > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <p className={`text-[10px] font-black uppercase tracking-wider ${availableRooms > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {availableRooms > 0 ? `${availableRooms} of ${totalRooms} Rooms Avail` : 'Fully Booked'}
                    </p>
                  </div>
                );
              })()}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl text-primary border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-primary"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-sm font-black">{property.averageRating || '4.8'}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Starting at</p>
              <p className="text-2xl font-black text-white">₹{property.price.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
