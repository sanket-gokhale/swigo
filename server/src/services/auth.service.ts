import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { JWT_SECRET } from '../config/env';

export const register = async (name: string, email: string, password: string, city: string = 'Pune', role: string = 'user') => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      city,
      role
    }
  });
  
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  
  const userResponse = { ...user, _id: user.id };
  delete (userResponse as any).password;
  
  return { token, user: userResponse };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  
  const userResponse = { ...user, _id: user.id };
  delete (userResponse as any).password;
  
  return { token, user: userResponse };
};

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const userResponse = { ...user, _id: user.id };
  delete (userResponse as any).password;
  return userResponse;
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiration to 15 minutes from now
  const expiresAt = new Date(Date.now() + 15 * 60000);

  // Clean up any existing OTPs for this email to prevent spam/confusion
  await prisma.otp.deleteMany({
    where: { email }
  });

  // Store the new OTP
  await prisma.otp.create({
    data: {
      email,
      otp,
      expiresAt
    }
  });

  return otp;
};

export const verifyOtp = async (email: string, otp: string) => {
  const otpRecord = await prisma.otp.findFirst({
    where: {
      email,
      otp,
      expiresAt: { gt: new Date() } // Ensure it hasn't expired
    }
  });

  if (!otpRecord) {
    throw new Error('Invalid or expired OTP');
  }

  return true;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  // Verify OTP again before resetting the password for security
  await verifyOtp(email, otp);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    }
  });

  // Delete the OTP so it cannot be used again
  await prisma.otp.deleteMany({
    where: { email }
  });

  const userResponse = { ...updatedUser, _id: updatedUser.id };
  delete (userResponse as any).password;
  return userResponse;
};