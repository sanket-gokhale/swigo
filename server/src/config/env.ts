import dotenv from 'dotenv';
dotenv.config();

const getPort = () => {
  const portArg = process.argv.find(arg => arg.startsWith('--port='));
  if (portArg) return parseInt(portArg.split('=')[1]);
  return process.env.PORT ? parseInt(process.env.PORT) : 5000;
};

export const PORT = getPort();
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const BREVO_API_KEY = process.env.BREVO_API_KEY;
export const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'appflux.tech@gmail.com';
export const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Swigo Support';

export const NODE_ENV = process.env.NODE_ENV || 'development';