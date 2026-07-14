import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as propertyService from '../services/property.service';
import { sendResponse } from '../utils/response';

export const getOwnerStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await propertyService.getOwnerStats(req.user.id);
    sendResponse(res, 200, 'Owner stats retrieved', stats);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const { city, lat, lng, distance, type, minRating } = req.query;
    const properties = await propertyService.getAllProperties({ city, lat, lng, distance, type, minRating });
    sendResponse(res, 200, 'Properties retrieved', properties);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getCities = async (req: AuthRequest, res: Response) => {
  try {
    const cities = await propertyService.getUniqueCities();
    sendResponse(res, 200, 'Unique cities retrieved', cities);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, 404, 'Property not found');
    }
    const property = await propertyService.getPropertyById(id);
    if (!property) return sendResponse(res, 404, 'Property not found');
    sendResponse(res, 200, 'Property retrieved', property);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const addProperty = async (req: AuthRequest, res: Response) => {
  try {
    const images = (req.files as any[])?.map(file => file.path) || [];
    
    const propertyData = { 
      ...req.body,
      price: Number(req.body.price),
      amenities: Array.isArray(req.body.amenities) 
        ? req.body.amenities 
        : req.body.amenities ? [req.body.amenities] : [],
      owner: req.user.id,
      images: images.length > 0 ? images : req.body.images,
      hasFoodService: req.body.hasFoodService === 'true' || req.body.hasFoodService === true,
      foodCharges: req.body.foodCharges ? Number(req.body.foodCharges) : undefined,
      linkedTiffinService: req.body.linkedTiffinService || undefined
    };

    const property = await propertyService.createProperty(propertyData);
    sendResponse(res, 201, 'Property created with images', property);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getMyProperties = async (req: AuthRequest, res: Response) => {
  try {
    const properties = await propertyService.getOwnerProperties(req.user.id);
    sendResponse(res, 200, 'My properties retrieved', properties);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, 404, 'Property not found');
    }
    const property: any = await propertyService.getPropertyById(id);
    
    if (!property) return sendResponse(res, 404, 'Property not found');
    
    const ownerId = property.owner?.id || property.owner?._id || property.ownerId || property.owner;
    if (ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Unauthorized to edit this property');
    }

    const images = (req.files as any[])?.map(file => file.path) || [];

    const updatedData: any = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      amenities: req.body.amenities 
        ? (Array.isArray(req.body.amenities) ? req.body.amenities : [req.body.amenities]) 
        : undefined,
      hasFoodService: req.body.hasFoodService !== undefined ? (req.body.hasFoodService === 'true' || req.body.hasFoodService === true) : undefined,
      foodCharges: req.body.foodCharges ? Number(req.body.foodCharges) : undefined,
      linkedTiffinService: req.body.linkedTiffinService || undefined
    };
    if (images.length > 0) {
      updatedData.images = images;
    } else if (req.body.images) {
      updatedData.images = req.body.images;
    }

    const updated = await propertyService.updatePropertyById(id, updatedData);
    sendResponse(res, 200, 'Property updated', updated);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, 404, 'Property not found');
    }
    const property: any = await propertyService.getPropertyById(id);
    
    if (!property) return sendResponse(res, 404, 'Property not found');
    
    const ownerId = property.owner?.id || property.owner?._id || property.ownerId || property.owner;
    if (ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Unauthorized to delete this property');
    }

    await propertyService.deletePropertyById(id);
    sendResponse(res, 200, 'Property deleted');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};