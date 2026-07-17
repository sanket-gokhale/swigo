import { fetchProperties } from '@/services/property.service';
import PropertyCard from '@/components/property/PropertyCard';

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
  const properties = await fetchProperties();

  return (
    <main className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            All Properties
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      </div>
    </main>
  );
}
