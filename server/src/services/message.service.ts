import prisma from '../config/prisma';

export const getChatHistory = async (userId: string, partnerId: string) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
  return messages.map(m => ({ ...m, _id: m.id, sender: m.senderId, receiver: m.receiverId }));
};

export const createMessage = async (data: any) => {
  const senderId = data.senderId || data.sender;
  const receiverId = data.receiverId || data.receiver;

  const msg = await prisma.message.create({
    data: {
      senderId,
      receiverId,
      content: data.content,
      messageType: data.messageType || 'text',
      mealDetails: data.mealDetails || null,
      pricingDetails: data.pricingDetails || null
    }
  });
  return { ...msg, _id: msg.id, sender: msg.senderId, receiver: msg.receiverId };
};
