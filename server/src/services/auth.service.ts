import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { JWT_SECRET } from '../config/env';

export const register = async (name: string, email: string, password: string, role: string = 'user') => {
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

  const resetToken = crypto.randomBytes(20).toString('hex');
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
    }
  });

  return resetToken;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) throw new Error('Password reset token is invalid or has expired');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  const userResponse = { ...updatedUser, _id: updatedUser.id };
  delete (userResponse as any).password;
  return userResponse;
};