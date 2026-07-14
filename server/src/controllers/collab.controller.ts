import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as collabService from '../services/collab.service';
import { sendResponse } from '../utils/response';

export const sendRequest = async (req: AuthRequest, res: Response) => {
  try {
    let data;
    if (req.user.role === 'owner') {
      data = { ...req.body, owner: req.user.id, initiatedBy: 'owner' };
    } else if (req.user.role === 'tiffin') {
      data = { ...req.body, provider: req.user.id, initiatedBy: 'provider' };
    } else {
      data = { ...req.body, initiatedBy: 'provider' };
    }
    const request = await collabService.createCollabRequest(data);
    sendResponse(res, 201, 'Collaboration request sent', request);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getMyRequestsAsOwner = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await collabService.getOwnerCollabRequests(req.user.id);
    sendResponse(res, 200, 'Collaboration requests retrieved', requests);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getMyRequestsAsProvider = async (req: AuthRequest, res: Response) => {
  try {
    const requests = await collabService.getProviderCollabRequests(req.user.id);
    sendResponse(res, 200, 'Sent collaboration requests retrieved', requests);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const collabReq = await collabService.getCollabRequestById(id);
    if (!collabReq) return sendResponse(res, 404, 'Request not found');

    const isOwner = req.user.id === collabReq.owner.toString();
    const isProvider = req.user.id === collabReq.provider.toString();

    if (!isOwner && !isProvider) {
      return sendResponse(res, 403, 'Unauthorized to update this request');
    }

    if (status === 'cancelled') {
      const isInitiator = (collabReq.initiatedBy === 'owner' && isOwner) || 
                          (collabReq.initiatedBy === 'provider' && isProvider);
      if (!isInitiator) {
        return sendResponse(res, 400, 'Only the sender can cancel this request');
      }
    }

    if (status === 'accepted' || status === 'rejected') {
      const isReceiver = (collabReq.initiatedBy === 'owner' && isProvider) || 
                         (collabReq.initiatedBy === 'provider' && isOwner);
      if (!isReceiver) {
        return sendResponse(res, 400, 'Only the receiver can accept or reject this request');
      }
    }

    const updated = await collabService.updateCollabStatus(id, status);
    sendResponse(res, 200, `Request ${status}`, updated);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};
