import mongoose from 'mongoose';
import prisma from './prisma';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.DATABASE_URL;
    if (!mongoUrl) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }
    
    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected successfully via Mongoose');
    
    // Call dummy Prisma connect to keep server-start code happy
    await prisma.$connect();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};