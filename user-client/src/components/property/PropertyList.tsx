import React from 'react';
import PropertyCard from './PropertyCard';
import { Property } from '../../types/property';

export default function PropertyList({ items }: { items: Property[] }) {
  return (
    <section>
      {items.map(p => <PropertyCard key={p._id} property={p} />)}
    </section>
  );
}
