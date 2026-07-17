import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as propertyService from '../services/property.service';
import { sendResponse } from '../utils/response';
import prisma from '../config/prisma';

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
    
    // Parse coordinates and ensure numeric elements
    let coordinates = undefined;
    if (req.body.coordinates) {
      const type = req.body.coordinates.type || 'Point';
      const coordsArray = req.body.coordinates.coordinates;
      if (coordsArray && Array.isArray(coordsArray)) {
        coordinates = {
          type,
          coordinates: [Number(coordsArray[0]) || 0, Number(coordsArray[1]) || 0]
        };
      }
    } else if (req.body['coordinates[type]'] !== undefined) {
      coordinates = {
        type: req.body['coordinates[type]'] || 'Point',
        coordinates: [
          Number(req.body['coordinates[coordinates][0]']) || 0,
          Number(req.body['coordinates[coordinates][1]']) || 0
        ]
      };
    }

    const propertyData = { 
      ...req.body,
      price: Number(req.body.price),
      coordinates: coordinates || undefined,
      amenities: Array.isArray(req.body.amenities) 
        ? req.body.amenities 
        : req.body.amenities ? [req.body.amenities] : [],
      owner: req.user.id,
      images: images.length > 0 ? images : req.body.images,
      hasFoodService: req.body.hasFoodService === 'true' || req.body.hasFoodService === true,
      foodCharges: req.body.foodCharges ? Number(req.body.foodCharges) : undefined,
      linkedTiffinService: req.body.linkedTiffinService || undefined
    };

    // Remove flat coordinate keys
    delete (propertyData as any)['coordinates[type]'];
    delete (propertyData as any)['coordinates[coordinates][0]'];
    delete (propertyData as any)['coordinates[coordinates][1]'];

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

    // Parse coordinates and ensure numeric elements
    let coordinates = undefined;
    if (req.body.coordinates) {
      const type = req.body.coordinates.type || 'Point';
      const coordsArray = req.body.coordinates.coordinates;
      if (coordsArray && Array.isArray(coordsArray)) {
        coordinates = {
          type,
          coordinates: [Number(coordsArray[0]) || 0, Number(coordsArray[1]) || 0]
        };
      }
    } else if (req.body['coordinates[type]'] !== undefined) {
      coordinates = {
        type: req.body['coordinates[type]'] || 'Point',
        coordinates: [
          Number(req.body['coordinates[coordinates][0]']) || 0,
          Number(req.body['coordinates[coordinates][1]']) || 0
        ]
      };
    }

    const updatedData: any = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      coordinates: coordinates || undefined,
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

    // Remove flat coordinate keys
    delete (updatedData as any)['coordinates[type]'];
    delete (updatedData as any)['coordinates[coordinates][0]'];
    delete (updatedData as any)['coordinates[coordinates][1]'];

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

export const getPropertyRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const property: any = await propertyService.getPropertyById(propertyId);
    if (!property) return sendResponse(res, 404, 'Property not found');

    const ownerId = property.owner?.id || property.owner?._id || property.ownerId || property.owner;
    if (ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Unauthorized to view these rooms');
    }

    const rooms = await prisma.room.findMany({
      where: { propertyId }
    });
    sendResponse(res, 200, 'Rooms retrieved', rooms.map(r => ({ ...r, _id: r.id })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const createPropertyRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { roomNo, type, price, availability, status } = req.body;

    const property: any = await propertyService.getPropertyById(propertyId);
    if (!property) return sendResponse(res, 404, 'Property not found');

    const ownerId = property.owner?.id || property.owner?._id || property.ownerId || property.owner;
    if (ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Unauthorized to manage rooms for this property');
    }

    const newRoom = await prisma.room.create({
      data: {
        roomNo,
        propertyId,
        type,
        price: Number(price),
        availability: availability || 'Available',
        status: status || 'Active'
      }
    });

    sendResponse(res, 201, 'Room created successfully', { ...newRoom, _id: newRoom.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updatePropertyRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // roomId
    
    const room = await prisma.room.findUnique({
      where: { id }
    });
    if (!room) return sendResponse(res, 404, 'Room not found');

    const property: any = await propertyService.getPropertyById(room.propertyId);
    if (!property) return sendResponse(res, 404, 'Property not found');

    const ownerId = property.owner?.id || property.owner?._id || property.ownerId || property.owner;
    if (ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Unauthorized to update this room');
    }

    const { roomNo, type, price, availability, status } = req.body;
    const updated = await prisma.room.update({
      where: { id },
      data: {
        roomNo,
        type,
        price: price ? Number(price) : undefined,
        availability,
        status
      }
    });

    sendResponse(res, 200, 'Room updated successfully', { ...updated, _id: updated.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const deletePropertyRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // roomId
    
    const room = await prisma.room.findUnique({
      where: { id }
    });
    if (!room) return sendResponse(res, 404, 'Room not found');

    const property: any = await propertyService.getPropertyById(room.propertyId);
    if (!property) return sendResponse(res, 404, 'Property not found');

    const ownerId = property.owner?.id || property.owner?._id || property.ownerId || property.owner;
    if (ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Unauthorized to delete this room');
    }

    await prisma.room.delete({
      where: { id }
    });

    sendResponse(res, 200, 'Room deleted successfully');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const bulkUpdatePropertyRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { inventory } = req.body; // e.g. { Available: { Single: 20, Double: 15, Shared: 15 }, Occupied: ... }

    const property: any = await propertyService.getPropertyById(propertyId);
    if (!property) return sendResponse(res, 404, 'Property not found');

    const ownerId = property.owner?.id || property.owner?._id || property.ownerId || property.owner;
    if (ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendResponse(res, 403, 'Unauthorized to manage rooms for this property');
    }

    const statuses = ['Available', 'Occupied', 'Maintenance'];
    const types = ['Single', 'Double', 'Shared'];

    for (const status of statuses) {
      for (const type of types) {
        const targetCount = Number(inventory[status]?.[type] || 0);

        // Find existing rooms of this type and status
        const existingRooms = await prisma.room.findMany({
          where: { propertyId, type, availability: status }
        });

        const currentCount = existingRooms.length;

        if (targetCount > currentCount) {
          // Create new rooms
          const diff = targetCount - currentCount;
          for (let i = 0; i < diff; i++) {
            const countAll = await prisma.room.count({ where: { propertyId } });
            const roomNo = `${type.charAt(0)}${countAll + 1}`;
            await prisma.room.create({
              data: {
                roomNo,
                propertyId,
                type,
                price: type === 'Single' ? 10000 : type === 'Double' ? 6000 : 4000,
                availability: status,
                status: 'Active'
              }
            });
          }
        } else if (targetCount < currentCount) {
          // Delete excess rooms
          const diff = currentCount - targetCount;
          const roomsToDelete = existingRooms.slice(0, diff);
          for (const room of roomsToDelete) {
            await prisma.room.delete({
              where: { id: room.id }
            });
          }
        }
      }
    }

    sendResponse(res, 200, 'Rooms inventory updated successfully');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};