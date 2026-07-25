import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db';
import prisma from '../config/prisma';

async function clearDB() {
  await connectDB();
  console.log('Wiping database records (reviews, requests, properties, rooms, tiffins, support tickets, messages, notifications, non-admin users)...');
  
  await prisma.review.deleteMany({});
  await prisma.collabRequest.deleteMany({});
  await prisma.bookingRequest.deleteMany({});
  await prisma.tiffinInterest.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.tiffin.deleteMany({});
  await prisma.supportTicket.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.otp.deleteMany({});
  await prisma.user.deleteMany({ where: { role: { not: 'admin' } } });

  console.log('Database records wiped successfully!');
}

clearDB()
  .catch((e) => {
    console.error('Error clearing database:', e);
    process.exit(1);
  });
