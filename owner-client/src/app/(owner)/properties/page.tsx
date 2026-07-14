'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOwnerProperties, deleteProperty } from '@/services/property.service';
import toast from 'react-hot-toast';

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const data = await getOwnerProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteProperty(id);
      toast.success('Property deleted');
      fetchProperties();
    } catch (err) {
      toast.error('Failed to delete property');
    }
  };

  if (loading) return <div className="space-y-6">
    {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-3xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">My Listings</h1>
        <Link href="/add-property" className="w-full sm:w-auto text-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
          + Add New Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-zinc-500 mb-6">You haven't listed any properties yet.</p>
          <Link href="/add-property" className="text-primary font-bold hover:underline">Start listing now →</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {properties.map((property) => (
            <div key={property._id} className="group relative flex flex-col md:flex-row gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
              {/* Placeholder for property image */}
              <div className="h-32 w-full md:w-48 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center text-3xl">
                🏠
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{property.title}</h3>
                    <p className="text-sm text-zinc-500">{property.location} • {property.type}</p>
                    <p className="text-xs font-medium text-primary mt-1 flex items-center gap-1">
                      <span>📞</span> {property.contactNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      ⭐ {property.rating || 'New'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-4">
                  <Link 
                    href={`/edit-property/${property._id}`}
                    className="text-sm font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Edit Details
                  </Link>
                  <button 
                    onClick={() => handleDelete(property._id)}
                    className="text-sm font-bold text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end justify-center border-t border-zinc-100 pt-4 md:border-t-0 md:pt-0">
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">₹{property.price}</p>
                <p className="text-xs text-zinc-500">per month</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
