# Swigo Backend

A Node.js/Express backend for the Swigo application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env` file.

3. Configure MongoDB connection in `.env` (`DATABASE_URL`) and Cloudinary environment variables, then generate Prisma client (`npx prisma generate`).

4. Run in development:
   ```bash
   npm run dev
   ```

5. Build and run:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

- Auth: `/api/auth`
- Users: `/api/user`
- Properties: `/api/properties`
- Bookings: `/api/bookings`
- Reviews: `/api/reviews`
- Tiffins: `/api/tiffins`