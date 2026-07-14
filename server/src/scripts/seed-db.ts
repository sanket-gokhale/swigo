import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  await connectDB();
  console.log('Wiping previous database records...');
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

  console.log('Seeding fresh initial demonstration data...');
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

  console.log('Database wiped and seeded successfully with clean records!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
