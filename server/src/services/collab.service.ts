import prisma from '../config/prisma';

export const createCollabRequest = async (data: any) => {
  const tiffinId = data.tiffinId || data.tiffin;
  const propertyId = data.propertyId || data.property;
  let ownerId = data.ownerId || data.owner;
  let providerId = data.providerId || data.provider;

  if (!tiffinId || !propertyId) {
    throw new Error('Tiffin ID and Property ID are required.');
  }

  if (!providerId) {
    const tiffin = await prisma.tiffin.findUnique({ where: { id: tiffinId } });
    if (!tiffin) throw new Error('Tiffin service not found');
    providerId = tiffin.providerId;
  }

  if (!ownerId) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new Error('Property not found');
    ownerId = property.ownerId;
  }

  const existing = await prisma.collabRequest.findFirst({
    where: {
      tiffinId,
      propertyId,
      status: 'pending'
    }
  });
  if (existing) throw new Error('A collaboration request is already pending for this property.');

  const request = await prisma.collabRequest.create({
    data: {
      tiffinId,
      propertyId,
      ownerId,
      providerId,
      status: data.status || 'pending',
      initiatedBy: data.initiatedBy || 'provider',
      message: data.message || null
    },
    include: { tiffin: true, property: true, owner: true, provider: true }
  });

  return { ...request, _id: request.id, owner: request.owner || request.ownerId, provider: request.provider || request.providerId };
};

export const getCollabRequestById = async (id: string) => {
  const req = await prisma.collabRequest.findUnique({
    where: { id },
    include: { tiffin: true, property: true, owner: true, provider: true }
  });
  if (!req) return null;
  return { ...req, _id: req.id, owner: req.ownerId, provider: req.providerId };
};

export const getOwnerCollabRequests = async (ownerId: string) => {
  const requests = await prisma.collabRequest.findMany({
    where: { ownerId },
    include: {
      tiffin: true,
      property: true,
      provider: {
        select: { id: true, name: true, email: true, phone: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return requests.map(r => ({ ...r, _id: r.id, owner: r.ownerId, provider: r.provider || r.providerId }));
};

export const getProviderCollabRequests = async (providerId: string) => {
  const requests = await prisma.collabRequest.findMany({
    where: { providerId },
    include: {
      tiffin: true,
      property: true,
      owner: {
        select: { id: true, name: true, email: true, phone: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return requests.map(r => ({ ...r, _id: r.id, owner: r.owner || r.ownerId, provider: r.providerId }));
};

export const updateCollabStatus = async (requestId: string, status: 'accepted' | 'rejected' | 'cancelled') => {
  const request = await prisma.collabRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error('Request not found');

  const updated = await prisma.collabRequest.update({
    where: { id: requestId },
    data: { status },
    include: { tiffin: true, property: true, owner: true, provider: true }
  });

  if (status === 'accepted') {
    await prisma.property.update({
      where: { id: request.propertyId },
      data: {
        linkedTiffinId: request.tiffinId,
        hasFoodService: true
      }
    });
    await prisma.tiffin.update({
      where: { id: request.tiffinId },
      data: {
        type: 'owner-collab'
      }
    });
  }

  return { ...updated, _id: updated.id, owner: updated.owner || updated.ownerId, provider: updated.provider || updated.providerId };
};
