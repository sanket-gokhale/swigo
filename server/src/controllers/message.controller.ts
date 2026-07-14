import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as messageService from '../services/message.service';
import { sendResponse } from '../utils/response';

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { partnerId } = req.params;
    const history = await messageService.getChatHistory(req.user.id, partnerId);
    sendResponse(res, 200, 'Chat history retrieved', history);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const sendMsg = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, sender: req.user.id };
    const msg = await messageService.createMessage(data);
    sendResponse(res, 201, 'Message sent', msg);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};
