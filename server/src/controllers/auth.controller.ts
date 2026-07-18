import { Request, Response } from 'express';
import { login, register, forgotPassword, resetPassword } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { sendResetPasswordEmail } from '../utils/email';

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
    
    console.log(`[PASSWORD RESET] Token for ${email}: ${resetToken}`);
    
    // Send the password reset token to the user's email
    try {
      await sendResetPasswordEmail(email, resetToken);
    } catch (emailError: any) {
      console.error('Failed to send reset password email:', emailError.message);
      console.warn('Please check your BREVO_API_KEY configuration in .env file.');
    }
    
    sendResponse(res, 200, 'Reset token generated and sent to email', { resetToken });
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