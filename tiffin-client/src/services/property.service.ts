import { getJSON } from './api';
import { Property } from '../types/property';

export async function fetchProperties(): Promise<Property[]> {
  const response = await getJSON('/properties');
  return response.data;
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const response = await getJSON(`/properties/${id}`);
  return response.data;
}
