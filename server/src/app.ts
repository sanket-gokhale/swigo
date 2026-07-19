import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import propertyRoutes from './routes/property.routes';
import bookingRoutes from './routes/booking.routes';
import reviewRoutes from './routes/review.routes';
import tiffinRoutes from './routes/tiffin.routes';
import collabRoutes from './routes/collab.routes';
import messageRoutes from './routes/message.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));
const allowedOrigins = [
  'https://swigo-user-client.vercel.app',
  'https://swigo-tiffin-client.vercel.app',
  'https://swigo-owner-client.vercel.app',
  'https://swigo-admin-client.vercel.app',
  'https://swigo.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Swigo API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tiffins', tiffinRoutes);
app.use('/api/collabs', collabRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

export default app;