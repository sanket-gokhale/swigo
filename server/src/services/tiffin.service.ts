import prisma from '../config/prisma';

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const getAllTiffins = async (filters: any = {}) => {
  const where: any = {};
  if (filters.city && String(filters.city).trim() !== '') {
    where.city = { contains: String(filters.city).trim(), mode: 'insensitive' };
  }
  if (filters.type && filters.type !== 'all' && String(filters.type).trim() !== '') {
    where.type = filters.type;
  }
  const tiffins = await prisma.tiffin.findMany({
    where,
    include: {
      provider: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  let result = tiffins.map((t: any) => ({ ...t, _id: t.id, provider: t.provider || t.providerId }));

  if (filters.lat && filters.lng) {
    const userLat = Number(filters.lat);
    const userLng = Number(filters.lng);
    const maxDist = filters.distance ? Number(filters.distance) : 50000;

    result = result.filter((tiffin: any) => {
      if (!tiffin.coordinates) return true;
      let tLat: number | undefined;
      let tLng: number | undefined;

      if (typeof tiffin.coordinates === 'object') {
        const coords = (tiffin.coordinates as any)?.coordinates || tiffin.coordinates;
        if (Array.isArray(coords) && coords.length >= 2) {
          tLng = Number(coords[0]);
          tLat = Number(coords[1]);
        }
      }

      if (tLat !== undefined && tLng !== undefined && !isNaN(tLat) && !isNaN(tLng)) {
        const dist = getDistanceInMeters(userLat, userLng, tLat, tLng);
        return dist <= maxDist;
      }
      return true;
    });
  }

  return result;
};

export const getTiffinById = async (id: string) => {
  const tiffin: any = await prisma.tiffin.findUnique({
    where: { id },
    include: {
      provider: { select: { id: true, name: true, email: true } }
    }
  });
  if (!tiffin) return null;
  return { ...tiffin, _id: tiffin.id, provider: tiffin.provider || tiffin.providerId };
};

export const getTiffinByProvider = async (providerId: string) => {
  const tiffin: any = await prisma.tiffin.findFirst({
    where: { providerId },
    include: {
      provider: { select: { id: true, name: true, email: true } }
    }
  });
  if (!tiffin) return null;
  return { ...tiffin, _id: tiffin.id, provider: tiffin.provider || tiffin.providerId };
};

export const updateTiffinById = async (id: string, data: any) => {
  const updateData: any = {};
  const allowedFields = [
    'name', 'description', 'city', 'area', 'coordinates', 'price',
    'images', 'mealPlans', 'deliveryAreas', 'menu', 'isStandalone', 'type'
  ];
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      if (key === 'price') {
        updateData[key] = Number(data[key]);
      } else if (key === 'isStandalone') {
        updateData[key] = Boolean(data[key]);
      } else {
        updateData[key] = data[key];
      }
    }
  }

  const updated: any = await prisma.tiffin.update({
    where: { id },
    data: updateData,
    include: { provider: { select: { id: true, name: true, email: true } } }
  });
  return { ...updated, _id: updated.id, provider: updated.provider || updated.providerId };
};

export const createTiffin = async (data: any) => {
  const providerId = data.providerId || data.provider;
  const tiffin: any = await prisma.tiffin.create({
    data: {
      name: data.name,
      providerId,
      price: Number(data.price),
      description: data.description || null,
      images: data.images || [],
      menu: data.menu || null,
      deliveryAreas: data.deliveryAreas || [],
      type: data.type || 'independent',
      city: data.city,
      area: data.area
    },
    include: { provider: { select: { id: true, name: true, email: true } } }
  });
  return { ...tiffin, _id: tiffin.id, provider: tiffin.provider || tiffin.providerId };
};

export const sendTiffinInterest = async (data: any) => {
  const userId = data.userId || data.user;
  const tiffinId = data.tiffinId || data.tiffin;

  const interest: any = await prisma.tiffinInterest.create({
    data: {
      userId,
      tiffinId,
      status: data.status || 'pending',
      planSelected: data.planSelected || null,
      requestType: data.requestType || 'independent',
      message: data.message || null
    },
    include: { user: true, tiffin: true }
  });
  return { ...interest, _id: interest.id, user: interest.user || interest.userId, tiffin: interest.tiffin || interest.tiffinId };
};

export const getProviderInterests = async (providerId: string) => {
  const tiffin = await prisma.tiffin.findFirst({ where: { providerId } });
  if (!tiffin) return [];

  const interests = await prisma.tiffinInterest.findMany({
    where: { tiffinId: tiffin.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      tiffin: { select: { id: true, name: true, price: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return interests.map((i: any) => ({ ...i, _id: i.id, user: i.user || i.userId, tiffin: i.tiffin || i.tiffinId }));
};

export const updateInterestStatus = async (interestId: string, status: string) => {
  const updated: any = await prisma.tiffinInterest.update({
    where: { id: interestId },
    data: { status },
    include: { user: true, tiffin: true }
  });
  return { ...updated, _id: updated.id, user: updated.user || updated.userId, tiffin: updated.tiffin || updated.tiffinId };
};

export const getUserInterests = async (userId: string) => {
  const interests = await prisma.tiffinInterest.findMany({
    where: { userId },
    include: {
      tiffin: { select: { id: true, name: true, price: true, images: true, description: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return interests.map((i: any) => ({ ...i, _id: i.id, user: i.userId, tiffin: i.tiffin || i.tiffinId }));
};