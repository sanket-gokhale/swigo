import { useEffect, useState } from 'react';
import { fetchProperties } from '../services/property.service';
import { Property } from '../types/property';

export default function useProperties() {
  const [items, setItems] = useState<Property[]>([]);
  useEffect(() => { fetchProperties().then(setItems).catch(() => setItems([])); }, []);
  return items;
}
