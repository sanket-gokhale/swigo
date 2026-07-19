# swigo

Full-stack food delivery, tiffin service, and PG/hostel management ecosystem.

## Deployed Live Applications
- **User Client**: [https://swigo-user-client.vercel.app](https://swigo-user-client.vercel.app)
- **Tiffin Client**: [https://swigo-tiffin-client.vercel.app](https://swigo-tiffin-client.vercel.app)
- **Owner Client**: [https://swigo-owner-client.vercel.app](https://swigo-owner-client.vercel.app)
- **Admin Client**: [https://swigo-admin-client.vercel.app](https://swigo-admin-client.vercel.app)
- **Backend API Server**: [https://swigo.onrender.com](https://swigo.onrender.com) (API Base: `https://swigo.onrender.com/api`)

## Ecosystem Architecture & Local Portals
- **User Client** (`http://localhost:3000`): Front-end portal for students, tenants, and food orderers.
- **Owner Client** (`http://localhost:3001`): Portal for PG and hostel owners to manage properties, rooms, and bookings.
- **Admin Client** (`http://localhost:3002`): Master IT monitoring & management control hub with real-time telemetry.
- **Tiffin Client** (`http://localhost:3003`): Kitchen dashboard for homemade meal and provider area.
- **Backend API Server** (`http://localhost:5000`): Express.js REST API with MongoDB database, Cloudinary image storage, and email services.

## Getting Started
Run all client apps and backend server in development mode:
```bash
# In server directory
npm run dev

# In each client directory (user-client, owner-client, admin-client, tiffin-client)
npx next dev
```

