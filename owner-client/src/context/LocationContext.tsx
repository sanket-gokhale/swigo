'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const saveLocation = async (lat: number, lng: number) => {
    setLoading(true);
    let address = '';
    
    try {
      // Reverse geocoding using Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      address = data.display_name || '';
      if (data.address) {
        const city = data.address.city || data.address.town || data.address.village || '';
        const suburb = data.address.suburb || data.address.neighbourhood || '';
        if (city || suburb) {
          address = `${suburb}${suburb && city ? ', ' : ''}${city}`;
        }
      }
    } catch (e) {
      console.error('Geocoding failed', e);
    }

    const data = { latitude: lat, longitude: lng, address };
    setLocation(data);
    localStorage.setItem('user_location', JSON.stringify(data));
    setLoading(false);
    toast.success(address ? `Located: ${address}` : 'Location updated', { id: 'location-toast' });
  };

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveLocation(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        let msg = 'Failed to get location';
        if (err.code === 1) msg = 'Location permission denied';
        else if (err.code === 2) msg = 'Location unavailable';
        else if (err.code === 3) msg = 'Location request timed out';
        
        setError(msg);
        setLoading(false);
        
        if (err.code === 1) {
          // Permission denied
          toast.error('Location access denied. Please enable it in browser settings.', { id: 'location-toast' });
          console.warn('Geolocation: Permission denied');
        } else if (err.code === 3) {
          // Timeout
          console.warn('Geolocation: Request timed out');
        } else {
          console.warn('Geolocation suppressed:', msg);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    const storedLocation = localStorage.getItem('user_location');
    if (storedLocation) {
      try {
        setLocation(JSON.parse(storedLocation));
        setLoading(false);
      } catch (e) {
        requestLocation();
      }
    } else {
      requestLocation();
    }
  }, []);

  return (
    <LocationContext.Provider value={{ location, loading, error, requestLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
