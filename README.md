# swigo

Full-stack food delivery, tiffin service, and PG/hostel management ecosystem.

## Ecosystem Architecture & Portals
- **User Client** (`http://localhost:3000`): Front-end portal for students, tenants, and food orderers.
- **Owner Client** (`http://localhost:3001`): Portal for PG and hostel owners to manage properties, rooms, and bookings.
- **Admin Client** (`http://localhost:3002`): Master IT monitoring & management control hub with real-time telemetry.
- **Tiffin Client** (`http://localhost:3003`): Kitchen dashboard for homemade meal and thali providers.
- **Backend API Server** (`http://localhost:5000`): Express.js REST API with MongoDB database via Prisma, Cloudinary image storage, and WebSocket broadcast engine.

## Getting Started
Run all client apps and backend server in development mode:
```bash
# In server directory
npm run dev

# In each client directory (user-client, owner-client, admin-client, tiffin-client)
npx next dev
```
