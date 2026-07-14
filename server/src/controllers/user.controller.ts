import { Request, Response } from 'express';
import { getUserProfile } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  user?: any;
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error('User ID not found in token');
    const user = await getUserProfile(userId);
    sendResponse(res, 200, 'Profile retrieved', user);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, phone, city, bio } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone: phone || null,
        city: city || null,
        bio: bio || null
      }
    });

    const userResponse = { ...updatedUser, _id: updatedUser.id };
    delete (userResponse as any).password;

    sendResponse(res, 200, 'Profile updated successfully', userResponse);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getOwnerDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.id;
    const role = req.user?.role;

    if (role !== 'owner' && role !== 'admin') {
      return sendResponse(res, 403, 'Access denied. Owners only.');
    }
    
    const totalProperties = await prisma.property.count({ where: { ownerId } });
    
    const properties = await prisma.property.findMany({
      where: { ownerId },
      select: { id: true }
    });
    const propertyIds = properties.map(p => p.id);
    const totalRequests = await prisma.bookingRequest.count({
      where: { propertyId: { in: propertyIds } }
    });
    const pendingRequests = await prisma.bookingRequest.count({
      where: { propertyId: { in: propertyIds }, status: 'pending' }
    });

    sendResponse(res, 200, 'Owner stats retrieved', {
      totalProperties,
      totalRequests,
      pendingRequests
    });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};