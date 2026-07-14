import prisma from '../config/prisma';

export const updatePropertyRating = async (propertyId: string) => {
  const reviews = await prisma.review.findMany({ where: { propertyId } });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length
      }
    });
  } else {
    await prisma.property.update({
      where: { id: propertyId },
      data: { averageRating: 0, reviewCount: 0 }
    });
  }
};

export const createReview = async (data: any) => {
  const userId = data.userId || data.user;
  const propertyId = data.propertyId || data.property;

  const review = await prisma.review.create({
    data: {
      userId,
      propertyId,
      rating: Number(data.rating),
      comment: data.comment
    },
    include: { user: true, property: true }
  });

  await updatePropertyRating(propertyId);

  return { ...review, _id: review.id, user: review.user || review.userId, property: review.property || review.propertyId };
};

export const getPropertyReviews = async (propertyId: string) => {
  const reviews = await prisma.review.findMany({
    where: { propertyId },
    include: {
      user: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return reviews.map(r => ({ ...r, _id: r.id, user: r.user || r.userId, property: r.propertyId }));
};

export const getOwnerReviews = async (ownerId: string) => {
  const properties = await prisma.property.findMany({
    where: { ownerId },
    select: { id: true }
  });
  const propertyIds = properties.map(p => p.id);

  const reviews = await prisma.review.findMany({
    where: { propertyId: { in: propertyIds } },
    include: {
      user: { select: { id: true, name: true } },
      property: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return reviews.map(r => ({ ...r, _id: r.id, user: r.user || r.userId, property: r.property || r.propertyId }));
};