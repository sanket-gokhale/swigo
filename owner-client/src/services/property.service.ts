import { getJSON, getAuthJSON, postAuthJSON, putAuthJSON, deleteAuthJSON } from './api';
import { Property } from '../types/property';

export async function fetchProperties(): Promise<Property[]> {
  const response = await getJSON('/properties');
  return response.data;
}

export async function getOwnerProperties(): Promise<Property[]> {
  const response = await getAuthJSON('/properties/my-properties');
  return response.data;
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const response = await getJSON(`/properties/${id}`);
  return response.data;
}

export async function createProperty(data: FormData): Promise<Property> {
  const response = await postAuthJSON('/properties', data);
  return response.data;
}

export async function updateProperty(id: string, data: any): Promise<Property> {
  const response = await putAuthJSON(`/properties/${id}`, data);
  return response.data;
}

export async function deleteProperty(id: string): Promise<void> {
  await deleteAuthJSON(`/properties/${id}`);
}
