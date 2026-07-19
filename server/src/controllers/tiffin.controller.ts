import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as tiffinService from '../services/tiffin.service';
import { sendResponse } from '../utils/response';

export const getTiffins = async (req: AuthRequest, res: Response) => {
  try {
    const { city, type, lat, lng, distance } = req.query;
    const tiffins = await tiffinService.getAllTiffins({ city, type, lat, lng, distance });
    sendResponse(res, 200, 'Tiffins retrieved', tiffins);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getTiffinById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tiffin = await tiffinService.getTiffinById(id);
    if (!tiffin) return sendResponse(res, 404, 'Tiffin service not found');
    sendResponse(res, 200, 'Tiffin details retrieved', tiffin);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getMyTiffin = async (req: AuthRequest, res: Response) => {
  try {
    const tiffin = await tiffinService.getTiffinByProvider(req.user.id);
    sendResponse(res, 200, 'My tiffin service retrieved', tiffin);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const addTiffin = async (req: AuthRequest, res: Response) => {
  try {
    const images = (req.files as any[])?.map(file => file.path) || [];
    const tiffinData = { 
      ...req.body, 
      provider: req.user.id,
      images: images.length > 0 ? images : req.body.images
    };
    const tiffin = await tiffinService.createTiffin(tiffinData);
    sendResponse(res, 201, 'Tiffin created', tiffin);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateTiffin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const tiffin: any = await tiffinService.getTiffinById(id);
    if (!tiffin) return sendResponse(res, 404, 'Tiffin service not found');
    
    const providerId = tiffin.provider?.id || tiffin.provider?._id || tiffin.providerId || tiffin.provider;
    if (providerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Unauthorized to edit this service');
    }

    const images = (req.files as any[])?.map(file => file.path) || [];
    const updatedData = { ...req.body };
    if (images.length > 0) {
      updatedData.images = images;
    } else if (req.body.images) {
      updatedData.images = req.body.images;
    }

    const updated = await tiffinService.updateTiffinById(id, updatedData);
    sendResponse(res, 200, 'Tiffin service updated', updated);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const expressInterest = async (req: AuthRequest, res: Response) => {
  try {
    const interestData = { ...req.body, user: req.user.id };
    const interest = await tiffinService.sendTiffinInterest(interestData);
    sendResponse(res, 201, 'Interest recorded', interest);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getIncomingInterests = async (req: AuthRequest, res: Response) => {
  try {
    const interests = await tiffinService.getProviderInterests(req.user.id);
    sendResponse(res, 200, 'Interests retrieved', interests);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateInterest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await tiffinService.updateInterestStatus(id, status);
    sendResponse(res, 200, 'Status updated', updated);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getMyInterests = async (req: AuthRequest, res: Response) => {
  try {
    const interests = await tiffinService.getUserInterests(req.user.id);
    sendResponse(res, 200, 'My interests retrieved', interests);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};