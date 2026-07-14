import React from 'react';
import { Property } from '../../types/property';
import RatingStars from '../review/RatingStars';

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="border border-gray-200 rounded-lg p-6 bg-white shadow-lg">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-2">{property.location}</p>
        <div className="flex items-center space-x-4 mb-4">
          {property.averageRating && (
            <div className="flex items-center space-x-2">
              <RatingStars value={property.averageRating} />
              <span className="text-sm text-gray-600">
                ({property.averageRating.toFixed(1)}) • {property.reviewCount || 0} reviews
              </span>
            </div>
          )}
          <div className="text-2xl font-bold text-green-600">
            ${property.price?.toLocaleString()}/night
          </div>
        </div>
      </div>

      {property.description && (
        <p className="text-gray-700 mb-4">{property.description}</p>
      )}

      {property.images && property.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {property.images.slice(0, 4).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${property.title} ${index + 1}`}
              className="w-full h-24 object-cover rounded-md"
            />
          ))}
        </div>
      )}

      {property.owner && (
        <div className="text-sm text-gray-500">
          Hosted by {property.owner.name}
        </div>
      )}
    </article>
  );
}
