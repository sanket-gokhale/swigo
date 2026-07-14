import { Request, Response } from 'express';
import { login, register, forgotPassword, resetPassword } from '../services/auth.service';
import { sendResponse } from '../utils/response';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await register(name, email, password, role);
    sendResponse(res, 201, 'User registered successfully', result);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await login(email, password);
    sendResponse(res, 200, 'Login successful', { token, user });
  } catch (error: any) {
    sendResponse(res, 401, error.message);
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const resetToken = await forgotPassword(email);
    // In a real app, you'd email this token. Here we return it for testing.
    sendResponse(res, 200, 'Reset token generated', { resetToken });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    sendResponse(res, 200, 'Password reset successful');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};