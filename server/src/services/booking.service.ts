import prisma from '../config/prisma';

export const createBookingRequest = async (data: any) => {
  const userId = data.userId || data.user;
  const propertyId = data.propertyId || data.property;
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  const booking = await prisma.bookingRequest.create({
    data: {
      userId,
      propertyId,
      startDate,
      endDate,
      visitTime: data.visitTime || null,
      message: data.message || null,
      status: data.status || 'pending'
    },
    include: { property: true, user: true }
  });

  return { ...booking, _id: booking.id };
};

export const getUserBookings = async (userId: string) => {
  const bookings = await prisma.bookingRequest.findMany({
    where: { userId },
    include: { property: true, user: true },
    orderBy: { createdAt: 'desc' }
  });
  return bookings.map(b => ({ ...b, _id: b.id }));
};

export const getOwnerRequests = async (ownerId: string) => {
  const properties = await prisma.property.findMany({
    where: { ownerId },
    select: { id: true }
  });
  const propertyIds = properties.map(p => p.id);

  const bookings = await prisma.bookingRequest.findMany({
    where: { propertyId: { in: propertyIds } },
    include: {
      property: true,
      user: {
        select: { id: true, name: true, email: true, phone: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return bookings.map(b => ({ ...b, _id: b.id }));
};

export const updateBookingStatus = async (bookingId: string, status: string, rejectionReason?: string) => {
  const updated = await prisma.bookingRequest.update({
    where: { id: bookingId },
    data: {
      status,
      rejectionReason: rejectionReason || null
    },
    include: { property: true, user: true }
  });
  return { ...updated, _id: updated.id };
};