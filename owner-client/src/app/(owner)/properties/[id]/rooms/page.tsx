'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getAuthJSON, postAuthJSON } from '@/services/api';

interface Room {
  _id: string;
  roomNo: string;
  type: string;
  price: number;
  availability: 'Available' | 'Occupied' | 'Maintenance';
  status: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
}

export default function ManageRoomsPage() {
  const { id: propertyId } = useParams();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Bulk Inventory spreadsheet state
  const [inventory, setInventory] = useState({
    Available: { Single: 0, Double: 0, Shared: 0 },
    Occupied: { Single: 0, Double: 0, Shared: 0 },
    Maintenance: { Single: 0, Double: 0, Shared: 0 }
  });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // Fetch property details
      const propData = await getAuthJSON(`/properties/${propertyId}`);
      setProperty(propData.data || propData);

      // Fetch rooms
      const roomsData = await getAuthJSON(`/properties/${propertyId}/rooms`);
      const allRooms: Room[] = roomsData.data || roomsData || [];
      setRooms(allRooms);

      // Populate inventory grid state
      setInventory({
        Available: {
          Single: allRooms.filter(r => r.type === 'Single' && r.availability === 'Available').length,
          Double: allRooms.filter(r => r.type === 'Double' && r.availability === 'Available').length,
          Shared: allRooms.filter(r => (r.type === 'Triple' || r.type === 'Shared') && r.availability === 'Available').length
        },
        Occupied: {
          Single: allRooms.filter(r => r.type === 'Single' && r.availability === 'Occupied').length,
          Double: allRooms.filter(r => r.type === 'Double' && r.availability === 'Occupied').length,
          Shared: allRooms.filter(r => (r.type === 'Triple' || r.type === 'Shared') && r.availability === 'Occupied').length
        },
        Maintenance: {
          Single: allRooms.filter(r => r.type === 'Single' && r.availability === 'Maintenance').length,
          Double: allRooms.filter(r => r.type === 'Double' && r.availability === 'Maintenance').length,
          Shared: allRooms.filter(r => (r.type === 'Triple' || r.type === 'Shared') && r.availability === 'Maintenance').length
        }
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load room details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) {
      fetchDetails();
    }
  }, [propertyId]);

  const saveBulkInventory = async () => {
    try {
      setSaving(true);
      await postAuthJSON(`/properties/${propertyId}/rooms/bulk`, {
        inventory
      });
      toast.success('Room inventory updated successfully!');
      fetchDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save inventory.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !property) {
    return (
      <div className="animate-pulse space-y-8 p-8">
        <div className="h-10 bg-zinc-100 rounded-2xl w-1/3" />
        <div className="h-64 bg-zinc-150 rounded-3xl" />
      </div>
    );
  }

  const totalPortfolioRooms = rooms.length;
  const totalAvailable = rooms.filter(r => r.availability === 'Available').length;
  const totalBooked = rooms.filter(r => r.availability === 'Occupied').length;

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Back to properties */}
      <div>
        <Link 
          href="/properties" 
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-primary transition-colors"
        >
          ← Back to Properties
        </Link>
      </div>

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">Room Manager</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
            {property?.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">
            📍 {property?.location}
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-3 gap-4 sm:gap-6">
        <div className="card-modern p-4 sm:p-6 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Rooms</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black text-white">{totalPortfolioRooms}</p>
        </div>
        <div className="card-modern p-4 sm:p-6 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black text-emerald-500">{totalAvailable}</p>
        </div>
        <div className="card-modern p-4 sm:p-6 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booked</p>
          <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black text-red-500">{totalBooked}</p>
        </div>
      </section>

      {/* Spreadsheet Inventory Bulk Editor */}
      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Bulk Room Inventory Editor</h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Directly edit room counts and status categories. Click save to synchronize the database.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-850 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <th className="pb-4">Total Rooms</th>
                <th className="pb-4">Single</th>
                <th className="pb-4">Double</th>
                <th className="pb-4">Multi Share</th>
                <th className="pb-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
              
              {/* Available Status Row */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="py-5 font-black text-zinc-900 dark:text-zinc-50 text-base">
                  {inventory.Available.Single + inventory.Available.Double + inventory.Available.Shared}
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Available.Single}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Available: { ...inventory.Available, Single: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Available.Double}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Available: { ...inventory.Available, Double: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Available.Shared}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Available: { ...inventory.Available, Shared: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5 text-right">
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 dark:bg-green-950/30 dark:text-green-400 shadow-sm border border-green-100 dark:border-green-900/50">Available</span>
                </td>
              </tr>

              {/* Booked Status Row */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="py-5 font-black text-zinc-900 dark:text-zinc-50 text-base">
                  {inventory.Occupied.Single + inventory.Occupied.Double + inventory.Occupied.Shared}
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Occupied.Single}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Occupied: { ...inventory.Occupied, Single: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Occupied.Double}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Occupied: { ...inventory.Occupied, Double: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Occupied.Shared}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Occupied: { ...inventory.Occupied, Shared: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5 text-right">
                  <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-400 shadow-sm border border-red-100 dark:border-red-900/50 animate-pulse">Booked</span>
                </td>
              </tr>

              {/* Maintenance Status Row */}
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="py-5 font-black text-zinc-900 dark:text-zinc-50 text-base">
                  {inventory.Maintenance.Single + inventory.Maintenance.Double + inventory.Maintenance.Shared}
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Maintenance.Single}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Maintenance: { ...inventory.Maintenance, Single: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Maintenance.Double}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Maintenance: { ...inventory.Maintenance, Double: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5">
                  <input
                    type="number"
                    min={0}
                    value={inventory.Maintenance.Shared}
                    onChange={(e) => setInventory({
                      ...inventory,
                      Maintenance: { ...inventory.Maintenance, Shared: Math.max(0, parseInt(e.target.value) || 0) }
                    })}
                    className="w-24 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-center font-bold text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </td>
                <td className="py-5 text-right">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 shadow-sm border border-zinc-200 dark:border-zinc-700/50">Maintenance</span>
                </td>
              </tr>

            </tbody>
          </table>

          {/* Action buttons */}
          <div className="mt-8 flex justify-end gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <button
              type="button"
              onClick={fetchDetails}
              className="px-6 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={saveBulkInventory}
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : '💾 Save Room Inventory'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
