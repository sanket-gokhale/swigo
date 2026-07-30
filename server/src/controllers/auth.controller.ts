import { Request, Response } from 'express';
import { login, register, forgotPassword, verifyOtp, resetPassword } from '../services/auth.service';
import { sendResponse } from '../utils/response';
import { sendResetPasswordEmail } from '../utils/email';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, city, role } = req.body;
    const result = await register(name, email, password, city, role);
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
    const otp = await forgotPassword(email);
    
    console.log(`[PASSWORD RESET] OTP for ${email}: ${otp}`);
    
    // Send the password reset OTP to the user's email
    try {
      await sendResetPasswordEmail(email, otp);
    } catch (emailError: any) {
      console.error('Failed to send reset password email:', emailError.message);
      console.warn('Please check your BREVO_API_KEY configuration in .env file.');
    }
    
    sendResponse(res, 200, 'OTP generated and sent to email');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    await verifyOtp(email, otp);
    sendResponse(res, 200, 'OTP verified successfully');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    await resetPassword(email, otp, newPassword);
    sendResponse(res, 200, 'Password reset successful');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};