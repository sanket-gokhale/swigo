import { getJSON } from './api';
import { Property } from '../types/property';

export async function fetchProperties(filters: any = {}): Promise<Property[]> {
  const queryParams = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) queryParams.append(key, filters[key]);
  });
  
  const queryString = queryParams.toString();
  const response = await getJSON(`/properties${queryString ? `?${queryString}` : ''}`);
  return response.data;
}
export async function fetchCities(): Promise<string[]> {
  const response = await getJSON('/properties/cities');
  return response.data;
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const response = await getJSON(`/properties/${id}`);
  return response.data;
}
