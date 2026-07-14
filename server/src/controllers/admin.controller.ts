import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { sendResponse } from '../utils/response';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  user?: any;
}

// 1. Dashboard Stats
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'user' } });
    const totalOwners = await prisma.user.count({ where: { role: 'owner' } });
    const totalTiffinProviders = await prisma.user.count({ where: { role: 'tiffin' } });
    const totalProperties = await prisma.property.count();
    const totalRooms = await prisma.room.count();
    const totalBookings = await prisma.bookingRequest.count();
    const activeCollabs = await prisma.collabRequest.count({ where: { status: 'accepted' } });
    
    const pendingBookings = await prisma.bookingRequest.count({ where: { status: 'pending' } });
    const pendingCollabs = await prisma.collabRequest.count({ where: { status: 'pending' } });
    const pendingRequests = pendingBookings + pendingCollabs;

    const recentBookings = await prisma.bookingRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { user: { select: { name: true } }, property: { select: { title: true } } }
    });
    const recentProperties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { owner: { select: { name: true } } }
    });
    
    const activities = [
      ...recentBookings.map(b => ({
        type: 'booking',
        title: `Booking request by ${b.user?.name || 'Guest'} for ${b.property?.title || 'Property'}`,
        time: b.createdAt,
        status: b.status
      })),
      ...recentProperties.map(p => ({
        type: 'property',
        title: `New Property "${p.title}" registered by ${p.owner?.name || 'Owner'}`,
        time: p.createdAt,
        status: p.status || 'Approved'
      }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

    sendResponse(res, 200, 'Stats retrieved', {
      totalUsers,
      totalOwners,
      totalTiffinProviders,
      totalProperties,
      totalRooms,
      totalBookings,
      activeCollabs,
      pendingRequests,
      activities
    });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 2. User Management
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;
    let where: any = {};
    if (role) where.role = String(role);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { phone: { contains: String(search), mode: 'insensitive' } },
        { city: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, city: true, status: true, businessName: true, kitchenName: true, bio: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Users retrieved', users.map(u => ({ ...u, _id: u.id })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, city, status, businessName, kitchenName } = req.body;
    
    const updated = await prisma.user.update({
      where: { id },
      data: { name, email, phone: phone || null, city: city || null, status: status || null, businessName: businessName || null, kitchenName: kitchenName || null },
      select: { id: true, name: true, email: true, phone: true, role: true, city: true, status: true, businessName: true, kitchenName: true, bio: true, createdAt: true }
    });
    
    sendResponse(res, 200, 'User updated successfully', { ...updated, _id: updated.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    sendResponse(res, 200, 'User deleted successfully');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) {
      return sendResponse(res, 400, 'Password must be at least 6 characters');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
    sendResponse(res, 200, 'Password reset successful');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 3. Owner Management
export const updateOwnerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const owner = await prisma.user.update({ where: { id }, data: { status } });
    const ownerResponse = { ...owner, _id: owner.id };
    delete (ownerResponse as any).password;
    sendResponse(res, 200, `Owner status updated to ${status}`, ownerResponse);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getOwnerProperties = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const properties = await prisma.property.findMany({
      where: { ownerId: id },
      include: { owner: { select: { id: true, name: true, email: true, phone: true } } }
    });
    sendResponse(res, 200, 'Owner properties retrieved', properties.map(p => ({ ...p, _id: p.id, owner: p.owner || p.ownerId })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 4. Tiffin Provider Management
export const updateTiffinStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const provider = await prisma.user.update({ where: { id }, data: { status } });
    const providerResponse = { ...provider, _id: provider.id };
    delete (providerResponse as any).password;
    sendResponse(res, 200, `Tiffin provider status updated to ${status}`, providerResponse);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getTiffinMenuAndReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tiffin: any = await prisma.tiffin.findFirst({ where: { providerId: id } });
    if (!tiffin) return sendResponse(res, 404, 'Tiffin kitchen not found for this provider');
    
    sendResponse(res, 200, 'Tiffin details retrieved', {
      tiffin: { ...tiffin, _id: tiffin.id, provider: tiffin.providerId },
      menu: tiffin.menu || {},
      mealPlans: tiffin.mealPlans || []
    });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 5. Property Management
export const getProperties = async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: { owner: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Properties retrieved', properties.map(p => ({ ...p, _id: p.id, owner: p.owner || p.ownerId })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updatePropertyAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, price, type, city, area, address, status } = req.body;
    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: title ? String(title) : undefined,
        price: price ? Number(price) : undefined,
        type: type ? String(type) : undefined,
        city: city ? String(city) : undefined,
        area: area ? String(area) : undefined,
        address: address ? String(address) : undefined,
        status: status ? String(status) : undefined
      },
      include: { owner: true }
    });
    sendResponse(res, 200, 'Property updated successfully', { ...updated, _id: updated.id, owner: updated.owner || updated.ownerId });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const deletePropertyAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.room.deleteMany({ where: { propertyId: id } });
    await prisma.property.delete({ where: { id } });
    sendResponse(res, 200, 'Property and its rooms deleted successfully');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 6. Room Management
export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        property: {
          select: { id: true, title: true, owner: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Rooms retrieved', rooms.map(r => ({ ...r, _id: r.id, property: r.property || r.propertyId })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { roomNo, property, type, price, availability, status } = req.body;
    const propertyId = property?.id || property?._id || property;
    const newRoom = await prisma.room.create({
      data: { roomNo, propertyId, type, price: Number(price), availability: availability || 'Available', status: status || 'Active' },
      include: { property: { select: { id: true, title: true } } }
    });
    sendResponse(res, 201, 'Room created successfully', { ...newRoom, _id: newRoom.id, property: newRoom.property || newRoom.propertyId });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roomNo, type, price, availability, status } = req.body;
    const updated = await prisma.room.update({
      where: { id },
      data: { roomNo, type, price: price ? Number(price) : undefined, availability, status },
      include: { property: { select: { id: true, title: true } } }
    });
    sendResponse(res, 200, 'Room updated successfully', { ...updated, _id: updated.id, property: updated.property || updated.propertyId });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.room.delete({ where: { id } });
    sendResponse(res, 200, 'Room deleted successfully');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 7. Booking Management
export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.bookingRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        property: { select: { id: true, title: true, location: true, ownerId: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Bookings retrieved', bookings.map(b => ({ ...b, _id: b.id, user: b.user || b.userId, property: b.property || b.propertyId })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateBookingStatusAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.bookingRequest.update({
      where: { id },
      data: { status },
      include: { user: { select: { name: true } }, property: { select: { title: true } } }
    });
    sendResponse(res, 200, `Booking status updated to ${status}`, { ...updated, _id: updated.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 8. Food Management
export const getMeals = async (req: Request, res: Response) => {
  try {
    const tiffins = await prisma.tiffin.findMany({
      include: { provider: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    const meals: any[] = [];
    
    for (const t of tiffins) {
      const interestCount = await prisma.tiffinInterest.count({ where: { tiffinId: t.id } });
      const plans = (t.mealPlans as any[]) || [];
      plans.forEach(plan => {
        meals.push({
          _id: `${t.id}-${plan.name}`,
          kitchenId: t.id,
          kitchenName: t.name,
          providerName: t.provider?.name || 'Provider',
          meal: plan.name,
          price: plan.price,
          description: plan.description,
          availability: 'Available',
          orders: interestCount
        });
      });
    }
    
    sendResponse(res, 200, 'Meals retrieved', meals);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 9. Collaboration Management
export const getCollabs = async (req: Request, res: Response) => {
  try {
    const collabs = await prisma.collabRequest.findMany({
      include: {
        tiffin: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
        owner: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Collaborations retrieved', collabs.map(c => ({ ...c, _id: c.id })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateCollabStatusAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.collabRequest.update({
      where: { id },
      data: { status },
      include: { tiffin: { select: { name: true } }, property: { select: { title: true } } }
    });
    sendResponse(res, 200, `Collaboration status updated to ${status}`, { ...updated, _id: updated.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const getCollabChat = async (req: Request, res: Response) => {
  try {
    const { ownerId, providerId } = req.query;
    if (!ownerId || !providerId) {
      return sendResponse(res, 400, 'Owner and Provider IDs are required');
    }
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: String(ownerId), receiverId: String(providerId) },
          { senderId: String(providerId), receiverId: String(ownerId) }
        ]
      },
      include: { sender: { select: { name: true } }, receiver: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }
    });
    sendResponse(res, 200, 'Messages retrieved', messages.map(m => ({ ...m, _id: m.id, sender: m.senderId, receiver: m.receiverId })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 10. Review Management
export const getReviewsAdmin = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const reviewsWithStatus = reviews.map(r => ({
      ...r,
      _id: r.id,
      user: r.user || r.userId,
      property: r.property || r.propertyId,
      status: 'Approved'
    }));
    
    sendResponse(res, 200, 'Reviews retrieved', reviewsWithStatus);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const deleteReviewAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    sendResponse(res, 200, 'Review deleted successfully');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 11. Reports & Analytics
export const generateReport = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    let data: any[] = [];
    
    switch (type) {
      case 'users':
        const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, phone: true, city: true, status: true, createdAt: true } });
        data = users.map(u => ({
          ID: u.id, Name: u.name, Email: u.email, Role: u.role, Phone: u.phone || 'N/A', City: u.city || 'Pune', Status: u.status || 'Active', Joined: u.createdAt
        }));
        break;
      case 'bookings':
        const bookings = await prisma.bookingRequest.findMany({ include: { user: { select: { name: true, email: true } }, property: { select: { title: true, price: true } } } });
        data = bookings.map(b => ({
          BookingID: b.id, Customer: b.user?.name || 'Guest', Email: b.user?.email || 'N/A', Property: b.property?.title || 'N/A', Price: b.property?.price || 0, Start: b.startDate, End: b.endDate, Status: b.status
        }));
        break;
      case 'properties':
        const properties = await prisma.property.findMany({ include: { owner: { select: { name: true } } } });
        data = properties.map(p => ({
          PropertyID: p.id, Title: p.title, Owner: p.owner?.name || 'N/A', City: p.city, Area: p.area, Type: p.type, Price: p.price, Status: p.status || 'Approved'
        }));
        break;
      case 'reviews':
        const reviews = await prisma.review.findMany({ include: { user: { select: { name: true } }, property: { select: { title: true } } } });
        data = reviews.map(r => ({
          ReviewID: r.id, User: r.user?.name || 'N/A', Property: r.property?.title || 'N/A', Rating: r.rating, Comment: r.comment, Date: r.createdAt
        }));
        break;
      case 'collabs':
        const collabs = await prisma.collabRequest.findMany({ include: { property: { select: { title: true } }, tiffin: { select: { name: true } }, owner: { select: { name: true } }, provider: { select: { name: true } } } });
        data = collabs.map(c => ({
          CollabID: c.id, Owner: c.owner?.name || 'N/A', Kitchen: c.tiffin?.name || 'N/A', Property: c.property?.title || 'N/A', Status: c.status, Date: c.createdAt
        }));
        break;
      case 'food':
        const tiffins = await prisma.tiffin.findMany({ include: { provider: { select: { name: true } } } });
        tiffins.forEach(t => {
          const plans = (t.mealPlans as any[]) || [];
          plans.forEach(plan => {
            data.push({
              Kitchen: t.name, Provider: t.provider?.name || 'N/A', Meal: plan.name, Price: plan.price, City: t.city, Standalone: t.isStandalone
            });
          });
        });
        break;
      default:
        return sendResponse(res, 400, 'Invalid report type requested');
    }
    
    sendResponse(res, 200, 'Report generated', data);
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 12. Notifications (Announcements / Warning Alerts)
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
    sendResponse(res, 200, 'Notifications retrieved', notifications.map(n => ({ ...n, _id: n.id })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { type, targetGroup, title, message } = req.body;
    const notification = await prisma.notification.create({ data: { type, targetGroup, title, message } });
    sendResponse(res, 201, 'Notification created successfully', { ...notification, _id: notification.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 13. Support Center
export const getTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: { sender: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
    sendResponse(res, 200, 'Support tickets retrieved', tickets.map(t => ({ ...t, _id: t.id, sender: t.sender || t.senderId })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { title, description, sender, category } = req.body;
    const senderId = sender?.id || sender?._id || sender;
    const newTicket = await prisma.supportTicket.create({
      data: { title, description, senderId, category, status: 'open' },
      include: { sender: { select: { name: true } } }
    });
    sendResponse(res, 201, 'Ticket created', { ...newTicket, _id: newTicket.id, sender: newTicket.sender || newTicket.senderId });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const resolveTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.supportTicket.update({
      where: { id },
      data: { status: 'resolved' },
      include: { sender: { select: { name: true } } }
    });
    sendResponse(res, 200, 'Ticket marked resolved', { ...updated, _id: updated.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.supportTicket.delete({ where: { id } });
    sendResponse(res, 200, 'Ticket deleted successfully');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 14. System Settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({ data: {} });
    }
    sendResponse(res, 200, 'Settings retrieved', { ...settings, _id: settings.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { 
      platformName, 
      logoUrl, 
      theme, 
      emailHost, 
      jwtExpiration, 
      cloudStorageBucket, 
      locationDefaultCity,
      userPortalMaintenance,
      ownerPortalMaintenance,
      tiffinPortalMaintenance,
      adminPortalMaintenance
    } = req.body;
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({ data: {} });
    }
    const updated = await prisma.systemSetting.update({
      where: { id: settings.id },
      data: {
        platformName: platformName || undefined,
        logoUrl: logoUrl || undefined,
        theme: theme || undefined,
        emailHost: emailHost || undefined,
        jwtExpiration: jwtExpiration || undefined,
        cloudStorageBucket: cloudStorageBucket || undefined,
        locationDefaultCity: locationDefaultCity || undefined,
        userPortalMaintenance: userPortalMaintenance !== undefined ? Boolean(userPortalMaintenance) : undefined,
        ownerPortalMaintenance: ownerPortalMaintenance !== undefined ? Boolean(ownerPortalMaintenance) : undefined,
        tiffinPortalMaintenance: tiffinPortalMaintenance !== undefined ? Boolean(tiffinPortalMaintenance) : undefined,
        adminPortalMaintenance: adminPortalMaintenance !== undefined ? Boolean(adminPortalMaintenance) : undefined
      }
    });
    sendResponse(res, 200, 'Settings updated successfully', { ...updated, _id: updated.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 15. OTP Management
export const getOtps = async (req: Request, res: Response) => {
  try {
    const otps = await prisma.otp.findMany({ orderBy: { createdAt: 'desc' } });
    sendResponse(res, 200, 'OTPs retrieved', otps.map(o => ({ ...o, _id: o.id })));
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const createOtpAdmin = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000);
    
    const newOtp = await prisma.otp.create({ data: { email, otp: generatedOtp, expiresAt } });
    
    await prisma.user.updateMany({ where: { email }, data: { otp: generatedOtp } });
    
    sendResponse(res, 201, 'OTP generated successfully', { ...newOtp, _id: newOtp.id });
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

export const deleteOtpAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.otp.delete({ where: { id } });
    sendResponse(res, 200, 'OTP token deleted');
  } catch (error: any) {
    sendResponse(res, 400, error.message);
  }
};

// 16. Seed Route
export const seedAdminData = async (req: Request, res: Response) => {
  try {
    await prisma.review.deleteMany({});
    await prisma.collabRequest.deleteMany({});
    await prisma.bookingRequest.deleteMany({});
    await prisma.tiffinInterest.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.tiffin.deleteMany({});
    await prisma.supportTicket.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.otp.deleteMany({});
    await prisma.user.deleteMany({ where: { role: { not: 'admin' } } });

    let admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      admin = await prisma.user.create({
        data: {
          name: 'System Admin',
          email: 'admin@swigo.com',
          password: hashedAdminPassword,
          role: 'admin',
          phone: '9876543210',
          city: 'Pune',
          status: 'Active'
        }
      });
    }

    const usersData = [
      { name: 'Sanket Gokhale', email: 'sanket@user.com', password: 'user123', role: 'user', phone: '9988776655', city: 'Pune' },
      { name: 'Amit Sharma', email: 'amit@user.com', password: 'user123', role: 'user', phone: '9876123450', city: 'Mumbai' },
      { name: 'Rahul Varma', email: 'rahul@user.com', password: 'user123', role: 'user', phone: '7766554433', city: 'Pune' }
    ];
    
    const seededUsers = [];
    for (const u of usersData) {
      const hash = await bcrypt.hash(u.password, 10);
      const user = await prisma.user.create({ data: { ...u, password: hash, status: 'Active' } });
      seededUsers.push(user);
    }

    const ownersData = [
      { name: 'Ramesh Patel', email: 'ramesh@owner.com', password: 'owner123', role: 'owner', phone: '9123456780', city: 'Pune', businessName: 'Ramesh Stays & PGs' },
      { name: 'Sunita Deshmukh', email: 'sunita@owner.com', password: 'owner123', role: 'owner', phone: '9234567890', city: 'Pune', businessName: 'Elite Homestays Pvt Ltd' }
    ];
    
    const seededOwners = [];
    for (const o of ownersData) {
      const hash = await bcrypt.hash(o.password, 10);
      const owner = await prisma.user.create({ data: { ...o, password: hash, status: 'Active' } });
      seededOwners.push(owner);
    }

    const tiffinsData = [
      { name: 'Kavita Joshi', email: 'kavita@tiffin.com', password: 'tiffin123', role: 'tiffin', phone: '9345678901', city: 'Pune', kitchenName: 'Kavita\'s Homely Kitchen' },
      { name: 'Dabbawala Services', email: 'dabbawala@tiffin.com', password: 'tiffin123', role: 'tiffin', phone: '9456789012', city: 'Mumbai', kitchenName: 'Mumbai Dabbawala Express' }
    ];
    
    const seededTiffins = [];
    for (const t of tiffinsData) {
      const hash = await bcrypt.hash(t.password, 10);
      const provider = await prisma.user.create({ data: { ...t, password: hash, status: 'Active' } });
      seededTiffins.push(provider);
    }

    const prop1 = await prisma.property.create({
      data: {
        title: 'Green Valley Premium PG',
        description: 'Fully furnished luxurious PG for boys and girls in Viman Nagar.',
        city: 'Pune',
        area: 'Viman Nagar',
        address: 'Lane 4, opposite Symbiosis, Viman Nagar',
        pincode: '411014',
        price: 8500,
        type: 'PG',
        amenities: ['WiFi', 'AC', 'Washing Machine', 'Gym'],
        contactNumber: '9123456780',
        ownerId: seededOwners[0].id,
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'],
        averageRating: 4.6,
        reviewCount: 2,
        genderPreference: 'Mixed',
        electricityBill: 'Unpaid',
        maintenance: 'Included',
        status: 'Approved'
      }
    });

    const prop2 = await prisma.property.create({
      data: {
        title: 'Elite Smart Homestay',
        description: 'Comfortable flat style homestay with clean amenities near Tech Park.',
        city: 'Pune',
        area: 'Hinjewadi',
        address: 'Phase 1, Hinjewadi main road',
        pincode: '411057',
        price: 12000,
        type: 'Homestay',
        amenities: ['WiFi', 'Kitchen', 'TV', 'Parking'],
        contactNumber: '9234567890',
        ownerId: seededOwners[1].id,
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
        averageRating: 4.8,
        reviewCount: 1,
        genderPreference: 'Mixed',
        electricityBill: 'Paid',
        maintenance: 'Included',
        status: 'Approved'
      }
    });

    await prisma.room.create({ data: { roomNo: '101-A', propertyId: prop1.id, type: 'Single', price: 9500, availability: 'Available', status: 'Active' } });
    await prisma.room.create({ data: { roomNo: '101-B', propertyId: prop1.id, type: 'Double', price: 7500, availability: 'Available', status: 'Active' } });
    await prisma.room.create({ data: { roomNo: '202-A', propertyId: prop2.id, type: 'Shared', price: 6000, availability: 'Occupied', status: 'Active' } });

    const tiffinKitchen1 = await prisma.tiffin.create({
      data: {
        name: 'Kavita\'s Homely Kitchen',
        description: 'Freshly cooked pure vegetarian home style meals delivered daily.',
        city: 'Pune',
        area: 'Viman Nagar',
        price: 120,
        providerId: seededTiffins[0].id,
        images: ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c'],
        mealPlans: [
          { name: 'Basic Lunch Veg Thali', price: 100, description: '3 Roti, 1 Sabji, Dal, Rice, Salad' },
          { name: 'Premium Dinner Veg Thali', price: 140, description: '3 Roti, Paneer Sabji, Dry Sabji, Dal, Jeera Rice, Sweet' }
        ],
        deliveryAreas: ['Viman Nagar', 'Kalyani Nagar', 'Kharadi'],
        menu: {
          monday: 'Dal Tadka, Mix Veg, Roti, Rice',
          tuesday: 'Rajma, Aloo Gobi, Roti, Rice',
          wednesday: 'Chole, Paneer Masala, Bhatura, Rice',
          thursday: 'Kadhi Pakoda, Bhindi Fry, Roti, Rice',
          friday: 'Dal Fry, Shahi Paneer, Roti, Rice',
          saturday: 'Aloo Paratha, Curd, Pickle',
          sunday: 'Special Veg Biryani, Raita'
        },
        isStandalone: true,
        type: 'independent'
      }
    });

    await prisma.property.update({
      where: { id: prop1.id },
      data: {
        linkedTiffinId: tiffinKitchen1.id,
        hasFoodService: true,
        foodCharges: 3000,
        foodType: 'Veg'
      }
    });

    await prisma.bookingRequest.create({
      data: {
        userId: seededUsers[0].id,
        propertyId: prop1.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        visitTime: '11:00 AM',
        message: 'Looking for a quiet single room.',
        status: 'pending'
      }
    });

    await prisma.bookingRequest.create({
      data: {
        userId: seededUsers[1].id,
        propertyId: prop2.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        visitTime: '04:00 PM',
        status: 'confirmed'
      }
    });

    await prisma.collabRequest.create({
      data: {
        tiffinId: tiffinKitchen1.id,
        propertyId: prop1.id,
        ownerId: seededOwners[0].id,
        providerId: seededTiffins[0].id,
        status: 'pending',
        initiatedBy: 'owner',
        message: 'We want to provide vegetarian dinner options to our 50 PG residents.'
      }
    });

    await prisma.review.create({ data: { userId: seededUsers[0].id, propertyId: prop1.id, rating: 4, comment: 'Very clean property and close to office. Highly recommend!' } });
    await prisma.review.create({ data: { userId: seededUsers[1].id, propertyId: prop1.id, rating: 5, comment: 'Staff is friendly and the food is great.' } });

    await prisma.supportTicket.create({ data: { title: 'Payment refund failed', description: 'Paid token fee for Green Valley PG, but transaction failed and money got deducted.', senderId: seededUsers[0].id, category: 'user', status: 'open' } });
    await prisma.supportTicket.create({ data: { title: 'Unable to update rent prices', description: 'Getting a server timeout error when saving modified room rents.', senderId: seededOwners[0].id, category: 'owner', status: 'open' } });

    await prisma.notification.create({ data: { type: 'announcement', targetGroup: 'all', title: 'Welcome to Swigo Admin Panel v2.0', message: 'We have updated our administrative management suites.' } });

    await prisma.otp.create({ data: { email: 'sanket@user.com', otp: '482019', expiresAt: new Date(Date.now() + 10 * 60000) } });

    await prisma.message.create({
      data: {
        senderId: seededOwners[0].id,
        receiverId: seededTiffins[0].id,
        content: "Hello Kavita, we want to partner with your kitchen service for Green Valley PG.",
        messageType: 'text'
      }
    });

    await prisma.message.create({
      data: {
        senderId: seededTiffins[0].id,
        receiverId: seededOwners[0].id,
        content: "Hi Ramesh! I'd love to collaborate. We can offer a custom lunch and dinner veg package.",
        messageType: 'meal_details',
        mealDetails: {
          name: 'Collaborated Veg Deal',
          description: 'Dal, Seasonal Sabji, Paneer, Rice, 4 Butter Rotis'
        }
      }
    });

    await prisma.tiffinInterest.create({
      data: {
        userId: seededUsers[0].id,
        tiffinId: tiffinKitchen1.id,
        message: 'Subscribe for daily basic lunch thali.',
        status: 'pending',
        requestType: 'independent',
        planSelected: 'Basic Lunch Veg Thali'
      }
    });

    await prisma.tiffinInterest.create({
      data: {
        userId: seededUsers[1].id,
        tiffinId: tiffinKitchen1.id,
        message: 'Deliver premium dinner thali.',
        status: 'contacted',
        requestType: 'property-linked',
        planSelected: 'Premium Dinner Veg Thali'
      }
    });

    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      await prisma.systemSetting.create({ data: {} });
    }

    sendResponse(res, 200, 'Database seeded successfully', {
      admin: admin.email,
      users: seededUsers.length,
      owners: seededOwners.length,
      tiffins: seededTiffins.length,
      properties: 2,
      rooms: 3,
      bookings: 2,
      collabs: 1,
      reviews: 2,
      tickets: 2
    });
  } catch (error: any) {
    sendResponse(res, 500, error.message);
  }
};
