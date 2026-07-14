import dotenv from 'dotenv';
dotenv.config();

const getPort = () => {
  const portArg = process.argv.find(arg => arg.startsWith('--port='));
  if (portArg) return parseInt(portArg.split('=')[1]);
  return process.env.PORT ? parseInt(process.env.PORT) : 5000;
};

export const PORT = getPort();
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';



export const NODE_ENV = process.env.NODE_ENV || 'development';