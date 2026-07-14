import prisma from '../config/prisma';

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getAllProperties = async (filters: any = {}) => {
  const where: any = {};

  if (filters.city) {
    where.city = { contains: filters.city, mode: 'insensitive' };
  }

  if (filters.type && filters.type !== 'All') {
    where.type = filters.type;
  }

  if (filters.minRating) {
    where.averageRating = { gte: Number(filters.minRating) };
  }

  let properties = await prisma.property.findMany({
    where,
    include: {
      owner: {
        select: { id: true, name: true, email: true, phone: true }
      },
      linkedTiffin: true
    },
    orderBy: { createdAt: 'desc' }
  });

  if (filters.lat && filters.lng) {
    const distance = filters.distance ? Number(filters.distance) : 5000;
    const targetLat = Number(filters.lat);
    const targetLng = Number(filters.lng);

    properties = properties.filter(p => {
      const coords = (p.coordinates as any)?.coordinates;
      if (coords && Array.isArray(coords) && coords.length >= 2) {
        const [lng, lat] = coords;
        return getDistanceInMeters(targetLat, targetLng, lat, lng) <= distance;
      }
      return true;
    });
  }

  return properties.map(p => ({
    ...p,
    _id: p.id,
    owner: p.owner || p.ownerId,
    linkedTiffinService: p.linkedTiffin || p.linkedTiffinId
  }));
};

export const getUniqueCities = async () => {
  const properties = await prisma.property.findMany({
    select: { city: true },
    distinct: ['city']
  });
  return properties.map(p => p.city);
};

export const createProperty = async (data: any) => {
  const ownerId = data.ownerId || data.owner;
  const linkedTiffinId = data.linkedTiffinId || data.linkedTiffinService || null;

  const property = await prisma.property.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location || null,
      city: data.city,
      area: data.area,
      address: data.address,
      pincode: data.pincode,
      coordinates: data.coordinates || { type: 'Point', coordinates: [0, 0] },
      price: Number(data.price),
      type: data.type || 'PG',
      amenities: data.amenities || [],
      contactNumber: data.contactNumber,
      ownerId,
      images: data.images || [],
      averageRating: data.averageRating ? Number(data.averageRating) : 0,
      reviewCount: data.reviewCount ? Number(data.reviewCount) : 0,
      genderPreference: data.genderPreference || 'Mixed',
      electricityBill: data.electricityBill || 'Unpaid',
      waterSupplyTime: data.waterSupplyTime || '24/7',
      waterBill: data.waterBill || 'Included',
      maintenance: data.maintenance || 'Included',
      hasFoodService: Boolean(data.hasFoodService || linkedTiffinId),
      linkedTiffinId,
      foodCharges: data.foodCharges ? Number(data.foodCharges) : null,
      foodType: data.foodType || null,
      status: data.status || 'Approved'
    },
    include: { owner: true, linkedTiffin: true }
  });

  return { ...property, _id: property.id, owner: property.owner || property.ownerId, linkedTiffinService: property.linkedTiffin || property.linkedTiffinId };
};

export const getOwnerProperties = async (ownerId: string) => {
  const properties = await prisma.property.findMany({
    where: { ownerId },
    include: { owner: true, linkedTiffin: true },
    orderBy: { createdAt: 'desc' }
  });
  return properties.map(p => ({ ...p, _id: p.id, owner: p.owner || p.ownerId, linkedTiffinService: p.linkedTiffin || p.linkedTiffinId }));
};

export const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, phone: true }
      },
      linkedTiffin: true,
      rooms: true
    }
  });
  if (!property) return null;
  return { ...property, _id: property.id, owner: property.owner || property.ownerId, linkedTiffinService: property.linkedTiffin || property.linkedTiffinId };
};

export const updatePropertyById = async (id: string, data: any) => {
  const updateData: any = {};
  
  // Safe whitelist of fields to update
  const allowedFields = [
    'title', 'description', 'location', 'city', 'area', 'address', 'pincode',
    'coordinates', 'price', 'type', 'amenities', 'contactNumber', 'images',
    'averageRating', 'reviewCount', 'genderPreference', 'electricityBill',
    'waterSupplyTime', 'waterBill', 'maintenance', 'hasFoodService', 'foodCharges',
    'foodType', 'status'
  ];

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      if (key === 'price') {
        updateData[key] = Number(data[key]);
      } else if (key === 'foodCharges') {
        updateData[key] = data[key] !== null && data[key] !== '' ? Number(data[key]) : null;
      } else if (key === 'hasFoodService') {
        updateData[key] = Boolean(data[key]);
      } else {
        updateData[key] = data[key];
      }
    }
  }

  const linkedTiffinId = data.linkedTiffinId || data.linkedTiffinService || null;
  if (linkedTiffinId !== undefined) {
    updateData.linkedTiffinId = typeof linkedTiffinId === 'object' ? (linkedTiffinId?.id || linkedTiffinId?._id || null) : linkedTiffinId;
  }

  const updated = await prisma.property.update({
    where: { id },
    data: updateData,
    include: { owner: true, linkedTiffin: true }
  });
  return { ...updated, _id: updated.id, owner: updated.owner || updated.ownerId, linkedTiffinService: updated.linkedTiffin || updated.linkedTiffinId };
};

export const deletePropertyById = async (id: string) => {
  const deleted = await prisma.property.delete({ where: { id } });
  return { ...deleted, _id: deleted.id };
};

export const getOwnerStats = async (ownerId: string) => {
  const totalProperties = await prisma.property.count({ where: { ownerId } });

  const properties = await prisma.property.findMany({
    where: { ownerId },
    select: { id: true, averageRating: true }
  });

  const totalRating = properties.reduce((acc, p) => acc + (p.averageRating || 0), 0);
  const averageRating = properties.length > 0 ? (totalRating / properties.length).toFixed(1) : 0;

  const propertyIds = properties.map(p => p.id);
  const totalRequests = await prisma.bookingRequest.count({
    where: { propertyId: { in: propertyIds } }
  });
  const pendingRequests = await prisma.bookingRequest.count({
    where: { propertyId: { in: propertyIds }, status: 'pending' }
  });

  return {
    totalProperties,
    totalRequests,
    pendingRequests,
    averageRating: Number(averageRating)
  };
};