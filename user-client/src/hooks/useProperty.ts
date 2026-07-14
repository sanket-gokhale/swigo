import { useEffect, useState } from 'react';
import { fetchPropertyById } from '../services/property.service';
import { Property } from '../types/property';

export default function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        const data = await fetchPropertyById(id);
        setProperty(data);
        setError(null);
      } catch (err) {
        setError('Failed to load property');
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProperty();
    }
  }, [id]);

  return { property, loading, error };
}
