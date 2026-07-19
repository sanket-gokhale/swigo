'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { getToken, getUser } from '@/services/auth.service';
import { API_BASE } from '@/services/api';
import toast from 'react-hot-toast';

export default function FindPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [myTiffin, setMyTiffin] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
  
  // Proximity Search States
  const [searchMode, setSearchMode] = useState<'city' | 'nearby'>('city');
  const [radius, setRadius] = useState('5000'); // Default 5km (5000 meters)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [collabRequests, setCollabRequests] = useState<any[]>([]);

  const fetchTiffin = async () => {
    try {
      const res = await fetch(`${API_BASE}/tiffins/my-service`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setMyTiffin(data.data);
    } catch (err) {
      console.error('Failed to fetch tiffin');
    }
  };

  const fetchCollabRequests = async () => {
    try {
      const res = await fetch(`${API_BASE}/collabs/provider`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setCollabRequests(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch collab requests');
    }
  };

  const fetchProperties = async (city = '') => {
    setLoading(true);
    try {
      let url = `${API_BASE}/properties`;
      
      if (searchMode === 'city') {
        if (city) {
          url += `?city=${city}`;
        }
      } else {
        let lat = 0;
        let lng = 0;

        if (gpsCoords) {
          lat = gpsCoords.lat;
          lng = gpsCoords.lng;
        } else if (myTiffin?.coordinates?.coordinates) {
          lng = myTiffin.coordinates.coordinates[0];
          lat = myTiffin.coordinates.coordinates[1];
        }

        if (lat !== 0 && lng !== 0) {
          url += `?lat=${lat}&lng=${lng}&distance=${radius}`;
        } else {
          toast.error('No coordinates found. Pin kitchen location or use browser GPS.');
          setProperties([]);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(url);
      const data = await res.json();
      setProperties(data.data || data || []);
    } catch (err) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const requestGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success('GPS coordinates retrieved successfully!');
      }, (err) => {
        toast.error('Failed to get GPS location. Check browser permission.');
      });
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    fetchTiffin();
    fetchCollabRequests();
  }, []);

  useEffect(() => {
    fetchProperties(searchCity);
  }, [searchMode, radius, gpsCoords, myTiffin]);

  const handleCollabRequest = async (property: any) => {
    if (!myTiffin) {
      toast.error('Please register your kitchen first');
      return;
    }

    setIsSubmitting(property._id);
    try {
      const res = await fetch(`${API_BASE}/collabs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          tiffin: myTiffin._id,
          property: property._id,
          owner: property.owner?._id || property.owner,
          message: `Hi, I am interested in providing food services for ${property.title}.`
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Collaboration request sent!');
        fetchCollabRequests(); // refresh status lists
      } else {
        throw new Error(data.message || 'Failed to send request');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(null);
    }
  };

  const getCollabStatus = (propertyId: string) => {
    const req = collabRequests.find(r => (r.property?._id || r.property) === propertyId);
    return req ? req.status : null;
  };

  const getDistanceStr = (propertyCoords: any) => {
    let sourceLat = 0;
    let sourceLng = 0;
    
    if (gpsCoords) {
      sourceLat = gpsCoords.lat;
      sourceLng = gpsCoords.lng;
    } else if (myTiffin?.coordinates?.coordinates) {
      sourceLng = myTiffin.coordinates.coordinates[0];
      sourceLat = myTiffin.coordinates.coordinates[1];
    }

    if (!propertyCoords?.coordinates || sourceLat === 0 || sourceLng === 0) return null;

    const [propLng, propLat] = propertyCoords.coordinates;
    const R = 6371; // Earth's radius in km
    const dLat = (propLat - sourceLat) * Math.PI / 180;
    const dLng = (propLng - sourceLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(sourceLat * Math.PI / 180) * Math.cos(propLat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return `${d.toFixed(1)} km away`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Find Properties to Collaborate</h1>
          <p className="text-slate-500 font-medium text-lg">Partner with property owners to provide food services to their residents.</p>
        </div>

        {/* Toggle between City Search and Proximity Search */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSearchMode('city')}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              searchMode === 'city'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            🏢 Search by City
          </button>
          <button
            onClick={() => setSearchMode('nearby')}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              searchMode === 'nearby'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            📍 Proximity (Nearby)
          </button>
        </div>

        {/* Search Bar / Input Area */}
        <div className="mb-12 flex flex-col md:flex-row gap-4 items-stretch max-w-3xl">
          {searchMode === 'city' ? (
            <div className="w-full flex gap-4 bg-white p-2 rounded-[2rem] shadow-xl border border-slate-100">
              <div className="flex-1 flex items-center px-6 gap-4">
                <span className="text-2xl">📍</span>
                <select 
                  className="w-full bg-transparent border-none outline-none font-bold text-slate-800 py-4 cursor-pointer"
                  value={searchCity}
                  onChange={e => {
                    setSearchCity(e.target.value);
                    fetchProperties(e.target.value);
                  }}
                >
                  <option value="">-- Select City (All Cities) --</option>
                  {['Pune', 'Mumbai', 'Nagpur', 'Delhi', 'Noida', 'Gurugram', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Nashik', 'Chhatrapati Sambhajinagar', 'Indore', 'Bhopal', 'Jaipur', 'Lucknow', 'Surat', 'Vadodara', 'Coimbatore', 'Kochi', 'Visakhapatnam', 'Chandigarh'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => fetchProperties(searchCity)}
                className="px-10 py-4 bg-primary text-white rounded-[1.5rem] font-black hover:opacity-90 transition-all"
              >
                Search
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="flex-1 flex items-center px-4 gap-4">
                <span className="text-2xl">🎯</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Location Source</span>
                  <span className="text-sm font-bold text-slate-800 leading-tight">
                    {gpsCoords 
                      ? `GPS: ${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}`
                      : myTiffin?.coordinates?.coordinates?.[0] !== 0 && myTiffin?.coordinates?.coordinates?.[0] !== undefined
                      ? `Kitchen: ${myTiffin.coordinates.coordinates[1].toFixed(4)}, ${myTiffin.coordinates.coordinates[0].toFixed(4)}`
                      : 'Pin kitchen coordinates or use browser GPS'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center px-6 gap-4 border-t md:border-t-0 md:border-l border-slate-100 w-full md:w-auto">
                <span className="text-2xl">📏</span>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Range</span>
                  <select 
                    value={radius} 
                    onChange={e => setRadius(e.target.value)}
                    className="bg-transparent border-none outline-none font-bold text-slate-800 py-1"
                  >
                    <option value="2000">2 km</option>
                    <option value="5000">5 km</option>
                    <option value="10000">10 km</option>
                    <option value="20000">20 km</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={requestGpsLocation}
                  className="flex-1 md:flex-initial px-6 py-4 bg-slate-100 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  📡 GPS
                </button>
                <button
                  onClick={() => fetchProperties()}
                  className="flex-1 md:flex-initial px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all whitespace-nowrap"
                >
                  Find Nearby
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-white animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map(property => (
              <div key={property._id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col">
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                    alt={property.title} 
                  />
                  <div className="absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900">
                    {property.type}
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{property.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm font-medium text-slate-500">{property.area}, {property.city}</p>
                      {(() => {
                        const dist = getDistanceStr(property.coordinates);
                        return dist ? (
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{dist}</span>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="mt-auto space-y-6">
                    <div className="flex items-center justify-between text-sm font-bold">
                       <span className="text-slate-400">Residents</span>
                       <span className="text-slate-800">{property.genderPreference}</span>
                    </div>
                    
                    {(() => {
                      const status = getCollabStatus(property._id);
                      let btnText = 'Propose Collaboration';
                      let btnClass = 'bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-lg shadow-primary/5';
                      let isDisabled = false;

                      if (property.linkedTiffinService) {
                        btnText = 'Already Partnered';
                        btnClass = 'bg-slate-100 text-slate-400 cursor-not-allowed';
                        isDisabled = true;
                      } else if (status === 'pending') {
                        btnText = 'Proposal Pending';
                        btnClass = 'bg-amber-100 text-amber-600 cursor-not-allowed';
                        isDisabled = true;
                      } else if (status === 'accepted') {
                        btnText = 'Partnered';
                        btnClass = 'bg-emerald-100 text-emerald-600 cursor-not-allowed';
                        isDisabled = true;
                      } else if (status === 'rejected') {
                        btnText = 'Proposal Declined';
                        btnClass = 'bg-rose-100 text-rose-600 cursor-not-allowed';
                        isDisabled = true;
                      }

                      return (
                        <button 
                          onClick={() => handleCollabRequest(property)}
                          disabled={isDisabled || isSubmitting === property._id}
                          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${btnClass}`}
                        >
                          {isSubmitting === property._id ? 'Sending...' : btnText}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
