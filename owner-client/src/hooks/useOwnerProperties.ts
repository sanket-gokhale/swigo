import { useState, useEffect } from 'react';
import { getOwnerProperties } from '../services/property.service';

export function useOwnerProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOwnerProperties();
        setProperties(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { properties, loading };
}
