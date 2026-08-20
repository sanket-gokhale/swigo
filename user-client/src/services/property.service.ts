import { getJSON } from './api';
import { Property } from '../types/property';

export async function fetchProperties(filters: any = {}): Promise<Property[]> {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });
    
    const queryString = queryParams.toString();
    const response = await getJSON(`/properties${queryString ? `?${queryString}` : ''}`);
    return response.data || [];
  } catch (err) {
    console.error('fetchProperties error:', err);
    return [];
  }
}

export async function fetchCities(): Promise<string[]> {
  try {
    const response = await getJSON('/properties/cities');
    return response.data || [];
  } catch (err) {
    console.error('fetchCities error:', err);
    return [];
  }
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  try {
    const response = await getJSON(`/properties/${id}`);
    return response.data || null;
  } catch (err) {
    console.error('fetchPropertyById error:', err);
    return null;
  }
}

