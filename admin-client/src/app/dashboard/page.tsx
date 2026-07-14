'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import { isAuthenticated, getUser, getProfile } from '../../services/auth.service';
import * as adminService from '../../services/admin.service';
import toast from 'react-hot-toast';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tab states
  const currentTab = searchParams.get('tab') || 'dashboard';
  
  // Data loading states
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  // Entity lists
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [collabs, setCollabs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [otps, setOtps] = useState<any[]>([]);
  const [portalStatuses, setPortalStatuses] = useState<Record<string, 'checking' | 'live' | 'offline' | 'maintenance'>>({
    user: 'checking',
    owner: 'checking',
    admin: 'checking',
    tiffin: 'checking',
    server: 'checking'
  });

  // IT Monitoring states
  const [logs, setLogs] = useState<{ id: string; timestamp: string; source: string; type: 'info' | 'warn' | 'error'; message: string }[]>([]);
  const [logFilter, setLogFilter] = useState('all');
  const [isLoadTesting, setIsLoadTesting] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [dbStats, setDbStats] = useState({
    status: 'healthy',
    poolSize: 15,
    activeConnections: 4,
    idleConnections: 11,
    queryLatency: '1.4ms',
    totalDocuments: 1204
  });

  const [liveStats, setLiveStats] = useState<Record<string, { latency: number; cpu: number; memory: number; uptime: string; errorRate: number }>>({
    user: { latency: 25, cpu: 12, memory: 45, uptime: '3d 4h 12m', errorRate: 0.05 },
    owner: { latency: 30, cpu: 18, memory: 52, uptime: '3d 4h 12m', errorRate: 0.08 },
    admin: { latency: 18, cpu: 8, memory: 38, uptime: '3d 4h 12m', errorRate: 0.01 },
    tiffin: { latency: 32, cpu: 15, memory: 48, uptime: '3d 4h 12m', errorRate: 0.04 },
    server: { latency: 12, cpu: 22, memory: 60, uptime: '12d 6h 44m', errorRate: 0.12 }
  });

  const [history, setHistory] = useState<Record<string, { cpu: number[]; latency: number[] }>>({
    user: { cpu: [10, 12, 11, 14, 12, 13, 12], latency: [22, 25, 24, 28, 25, 26, 25] },
    owner: { cpu: [15, 18, 17, 20, 18, 19, 18], latency: [28, 30, 29, 32, 30, 31, 30] },
    admin: { cpu: [6, 8, 7, 9, 8, 8, 8], latency: [16, 18, 17, 19, 18, 18, 18] },
    tiffin: { cpu: [12, 15, 14, 16, 15, 16, 15], latency: [30, 32, 31, 34, 32, 33, 32] },
    server: { cpu: [18, 22, 20, 25, 22, 24, 22], latency: [10, 12, 11, 13, 12, 12, 12] }
  });
  
  // Filter & search states
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearchText, setUserSearchText] = useState('');
  const [supportCategoryFilter, setSupportCategoryFilter] = useState('user');
  
  // Modal & form states
  const [activeModal, setActiveModal] = useState<string | null>(null); // 'editUser', 'resetPassword', 'viewMenu', 'addRoom', 'warning'
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [formInputs, setFormInputs] = useState<any>({});
  
  // Load admin info
  useEffect(() => {
    const checkAuth = async () => {
      const localUser = getUser();
      if (!localUser || localUser.role !== 'admin') {
        router.push('/login?error=Unauthorized: Admin access only');
        return;
      }
      setAdminUser(localUser);
      
      try {
        const fresh = await getProfile();
        if (fresh) setAdminUser(fresh);
      } catch (e) {
        console.error('Failed to update admin profile details:', e);
      }
    };
    checkAuth();
  }, [router]);

  const pingPortals = async (freshSettings?: any) => {
    const activeSettings = freshSettings || settings;
    const targets = [
      { key: 'user', url: 'http://localhost:3000' },
      { key: 'owner', url: 'http://localhost:3001' },
      { key: 'admin', url: 'http://localhost:3002' },
      { key: 'tiffin', url: 'http://localhost:3003' },
      { key: 'server', url: 'http://localhost:5000' }
    ];

    const nextStatuses: any = {
      user: 'checking',
      owner: 'checking',
      admin: 'checking',
      tiffin: 'checking',
      server: 'checking'
    };

    setPortalStatuses({ ...nextStatuses });

    for (const target of targets) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        await fetch(target.url, { 
          mode: 'no-cors', 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        nextStatuses[target.key] = 'live';
      } catch (err) {
        nextStatuses[target.key] = 'offline';
      }
    }
    
    if (activeSettings) {
      if (activeSettings.userPortalMaintenance && nextStatuses.user === 'live') nextStatuses.user = 'maintenance';
      if (activeSettings.ownerPortalMaintenance && nextStatuses.owner === 'live') nextStatuses.owner = 'maintenance';
      if (activeSettings.tiffinPortalMaintenance && nextStatuses.tiffin === 'live') nextStatuses.tiffin = 'maintenance';
      if (activeSettings.adminPortalMaintenance && nextStatuses.admin === 'live') nextStatuses.admin = 'maintenance';
    }
    
    setPortalStatuses(nextStatuses);
  };

  // IT Monitoring simulation loop
  useEffect(() => {
    if (currentTab !== 'portals' && currentTab !== 'dashboard') return;

    // Seed initial logs if empty
    if (logs.length === 0) {
      const initialLogs = [
        { id: '1', timestamp: new Date(Date.now() - 30000).toLocaleTimeString(), source: 'server', type: 'info' as const, message: 'Database connection pool active: 11 idle connections' },
        { id: '2', timestamp: new Date(Date.now() - 25000).toLocaleTimeString(), source: 'user', type: 'info' as const, message: 'Hydration completed for /dashboard' },
        { id: '3', timestamp: new Date(Date.now() - 20000).toLocaleTimeString(), source: 'owner', type: 'info' as const, message: 'Restored session for owner@owner.com' },
        { id: '4', timestamp: new Date(Date.now() - 15000).toLocaleTimeString(), source: 'server', type: 'info' as const, message: 'GET /api/properties?city=Pune 200 OK - 34ms' },
        { id: '5', timestamp: new Date(Date.now() - 10000).toLocaleTimeString(), source: 'tiffin', type: 'warn' as const, message: 'API response delayed: 145ms' }
      ];
      setLogs(initialLogs);
    }

    const interval = setInterval(() => {
      // 1. Update stats with slight perturbations
      setLiveStats(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const base = next[key];
          let targetCpu = 0;
          let targetLatency = 0;

          if (isLoadTesting) {
            targetCpu = Math.floor(Math.random() * 15) + 80; // 80% to 95%
            targetLatency = Math.floor(Math.random() * 100) + 200; // 200ms to 300ms
          } else {
            const baseCpus: Record<string, number> = { user: 12, owner: 18, admin: 8, tiffin: 15, server: 22 };
            const baseLatencies: Record<string, number> = { user: 25, owner: 30, admin: 18, tiffin: 32, server: 12 };
            targetCpu = Math.max(2, baseCpus[key] + Math.floor(Math.random() * 7) - 3);
            targetLatency = Math.max(5, baseLatencies[key] + Math.floor(Math.random() * 9) - 4);
          }

          next[key] = {
            ...base,
            cpu: targetCpu,
            latency: targetLatency,
            errorRate: isLoadTesting ? parseFloat((Math.random() * 5 + 2).toFixed(2)) : parseFloat((Math.random() * 0.2 + 0.02).toFixed(2))
          };
        });
        return next;
      });

      // 2. Append history
      setHistory(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const currentHistory = next[key];
          
          setLiveStats(stats => {
            const currentStat = stats[key];
            const newCpu = [...currentHistory.cpu.slice(1), currentStat.cpu];
            const newLatency = [...currentHistory.latency.slice(1), currentStat.latency];
            next[key] = { cpu: newCpu, latency: newLatency };
            return stats;
          });
        });
        return next;
      });

      // 3. Generate random log
      const sources = ['user', 'owner', 'tiffin', 'admin', 'server'];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const logTypes: ('info' | 'warn' | 'error')[] = ['info', 'info', 'info', 'info', 'warn', 'info'];
      if (isLoadTesting) {
        logTypes.push('warn', 'error', 'warn');
      }
      const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];

      const logPool: Record<string, string[]> = {
        user: [
          'Rendering page /search',
          'Updated search filter: type=PG, city=Pune',
          'Fetched 12 nearby properties successfully',
          'User clicked "Book Room 101-A"',
          'Initial check-in form details validated'
        ],
        owner: [
          'Owner logged in from IP 192.168.1.45',
          'Fetched property booking requests: count=3',
          'Approved booking request #B1042',
          'Updated property details for "Green Valley Premium PG"',
          'Owner checked billing status for room 101-B'
        ],
        tiffin: [
          'Updated weekly menu schedule for Monday',
          'Dispensed menu data to user-client channel',
          'Received user interest notification for dinner thali',
          'Saved new delivery area: Kharadi',
          'Kitchen kitchenName="Kavita\'s Kitchen" status=Active'
        ],
        admin: [
          'Admin page load: currentTab=portals',
          'Pinged active gateway systems: latency=12ms',
          'Generated PDF stats export token #TX9910',
          'Broadcast message sent to all active tiffin providers',
          'Reset password request processed for user amit@user.com'
        ],
        server: [
          'GET /api/properties?city=Pune 200 OK - 32ms',
          'POST /api/auth/login 200 OK - 110ms',
          'GET /api/admin/stats 200 OK - 54ms',
          'PUT /api/bookings/64bf1d0/status 200 OK - 88ms',
          'GET /api/tiffins?lat=18.52&lng=73.85 200 OK - 41ms',
          'MongoDB connection pool active: 4 active connections',
          'Socket.io broadcast broadcasted client.status=online'
        ]
      };

      const serverErrors = [
        'MongoDB query timeout reached (retrying)',
        'Failed to dispatch SMTP email notification (host unreachable)',
        'JWT validation failed: TokenExpiredError',
        'CORS preflight request blocked from unauthorized local port'
      ];

      const messages = randomType === 'error' && randomSource === 'server' 
        ? serverErrors 
        : logPool[randomSource];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      setLogs(prev => {
        const newLog = {
          id: Math.random().toString(),
          timestamp: new Date().toLocaleTimeString(),
          source: randomSource,
          type: randomType,
          message: randomMessage
        };
        return [newLog, ...prev.slice(0, 49)];
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [currentTab, isLoadTesting, logs.length]);

  const startLoadTest = () => {
    setIsLoadTesting(true);
    toast.success('Simulated Load Test started! Generating heavy concurrent traffic spikes.');
    setTimeout(() => {
      setIsLoadTesting(false);
      toast.success('Simulated Load Test completed. Subsystem traffic settling down.');
    }, 6000);
  };

  const renderSvgGraph = (data: number[], max: number, colorClass: string) => {
    const width = 240;
    const height = 40;
    if (!data || data.length === 0) return null;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (val / max) * height * 0.8 - 4;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="40" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          points={points}
          className={`${colorClass} transition-all duration-500`}
        />
        <path
          d={`M 0,${height} L ${points} L ${width},${height} Z`}
          fill="currentColor"
          className={`${colorClass} opacity-10 transition-all duration-500`}
        />
      </svg>
    );
  };

  // Fetch relevant tab data
  useEffect(() => {
    if (!adminUser) return;
    
    const loadTabData = async () => {
      setLoading(true);
      try {
        switch (currentTab) {
          case 'dashboard':
            const statsData = await adminService.fetchStats();
            setStats(statsData);
            const dashSettings = await adminService.fetchSettings();
            setSettings(dashSettings);
            await pingPortals(dashSettings);
            break;
          case 'users':
            const usersData = await adminService.fetchUsers(userRoleFilter, userSearchText);
            const otpsData = await adminService.fetchOtps();
            setUsers(usersData);
            setOtps(otpsData);
            break;
          case 'owners':
            const ownersData = await adminService.fetchUsers('owner');
            setUsers(ownersData);
            break;
          case 'tiffins':
            const tiffinsData = await adminService.fetchUsers('tiffin');
            setUsers(tiffinsData);
            break;
          case 'properties':
            const propsData = await adminService.fetchPropertiesAdmin();
            setProperties(propsData);
            break;
          case 'rooms':
            const roomsData = await adminService.fetchRooms();
            const allProps = await adminService.fetchPropertiesAdmin();
            setRooms(roomsData);
            setProperties(allProps);
            break;
          case 'bookings':
            const bookingsData = await adminService.fetchBookingsAdmin();
            setBookings(bookingsData);
            break;
          case 'food':
            const mealsData = await adminService.fetchMeals();
            setMeals(mealsData);
            break;
          case 'collabs':
            const collabsData = await adminService.fetchCollabsAdmin();
            setCollabs(collabsData);
            break;
          case 'reviews':
            const reviewsData = await adminService.fetchReviewsAdmin();
            setReviews(reviewsData);
            break;
          case 'notifications':
            const notificationsData = await adminService.fetchNotifications();
            setNotifications(notificationsData);
            break;
          case 'support':
            const ticketsData = await adminService.fetchSupportTickets();
            setTickets(ticketsData);
            break;
          case 'settings':
            const settingsData = await adminService.fetchSettings();
            setSettings(settingsData);
            break;
          case 'portals':
            const sData = await adminService.fetchSettings();
            setSettings(sData);
            await pingPortals(sData);
            break;
          case 'profile':
            setFormInputs({
              name: adminUser.name || '',
              phone: adminUser.phone || '',
              city: adminUser.city || '',
              bio: adminUser.bio || ''
            });
            break;
          default:
            break;
        }
      } catch (err: any) {
        toast.error(err.message || 'Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    loadTabData();
  }, [currentTab, adminUser, userRoleFilter, userSearchText]);

  // Seeding trigger
  const handleTriggerSeed = async () => {
    const isConfirm = window.confirm('This will wipe all existing platform mock records and seed a clean demonstration environment. Proceed?');
    if (!isConfirm) return;
    
    setLoading(true);
    try {
      const res = await adminService.triggerDbSeed();
      toast.success(res.message || 'Seeded successfully!');
      // Force reload stats
      const statsData = await adminService.fetchStats();
      setStats(statsData);
    } catch (err: any) {
      toast.error(err.message || 'Seeding failed');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await adminService.updateUser(selectedEntity._id, formInputs);
      setUsers(users.map(u => u._id === selectedEntity._id ? updated : u));
      toast.success('User updated successfully');
      setActiveModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const handleUserDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const handleUserPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.resetUserPassword(selectedEntity._id, formInputs.password);
      toast.success('Password updated successfully');
      setActiveModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    }
  };

  // Owner/Tiffin Approvals & status
  const handleOwnerStatus = async (id: string, status: string) => {
    try {
      const updated = await adminService.updateOwnerStatus(id, status);
      setUsers(users.map(u => u._id === id ? { ...u, status: updated.status } : u));
      toast.success(`Owner marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleTiffinStatus = async (id: string, status: string) => {
    try {
      const updated = await adminService.updateTiffinStatus(id, status);
      setUsers(users.map(u => u._id === id ? { ...u, status: updated.status } : u));
      toast.success(`Tiffin provider marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Properties Approvals
  const handlePropertyStatus = async (id: string, status: 'Approved' | 'Hidden') => {
    try {
      const updated = await adminService.updatePropertyAdmin(id, { status });
      setProperties(properties.map(p => p._id === id ? updated : p));
      toast.success(`Property visibility marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update property status');
    }
  };

  const handlePropertyDelete = async (id: string) => {
    if (!window.confirm('Delete this property and all linked rooms?')) return;
    try {
      await adminService.deletePropertyAdmin(id);
      setProperties(properties.filter(p => p._id !== id));
      toast.success('Property deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete property');
    }
  };

  // Rooms Actions
  const handleRoomCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRoom = await adminService.createRoom(formInputs);
      setRooms([newRoom, ...rooms]);
      toast.success('Room created successfully');
      setActiveModal(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create room');
    }
  };

  const handleRoomDelete = async (id: string) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await adminService.deleteRoom(id);
      setRooms(rooms.filter(r => r._id !== id));
      toast.success('Room deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete room');
    }
  };

  const handleToggleRoomAvailability = async (room: any) => {
    const nextAvailability = room.availability === 'Available' ? 'Occupied' : 'Available';
    try {
      const updated = await adminService.updateRoom(room._id, { availability: nextAvailability });
      setRooms(rooms.map(r => r._id === room._id ? updated : r));
      toast.success(`Room marked ${nextAvailability}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update availability');
    }
  };

  // Bookings
  const handleBookingStatus = async (id: string, status: string) => {
    try {
      const updated = await adminService.updateBookingStatusAdmin(id, status);
      setBookings(bookings.map(b => b._id === id ? { ...b, status: updated.status } : b));
      toast.success(`Booking status updated to: ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update booking status');
    }
  };

  // Collabs
  const handleCollabStatus = async (id: string, status: string) => {
    try {
      const updated = await adminService.updateCollabStatusAdmin(id, status);
      setCollabs(collabs.map(c => c._id === id ? { ...c, status: updated.status } : c));
      toast.success(`Collaboration updated to: ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update collaboration');
    }
  };

  // Reviews
  const handleReviewDelete = async (id: string) => {
    if (!window.confirm('Delete this review comment?')) return;
    try {
      await adminService.deleteReviewAdmin(id);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success('Review deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete review');
    }
  };

  // OTP Generation
  const handleGenerateOtp = async (email: string) => {
    try {
      const newOtp = await adminService.createOtp(email);
      setOtps([newOtp, ...otps]);
      toast.success(`OTP generated: ${newOtp.otp} for ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate OTP');
    }
  };

  const handleDeleteOtp = async (id: string) => {
    try {
      await adminService.deleteOtp(id);
      setOtps(otps.filter(o => o._id !== id));
      toast.success('OTP revoked/deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete OTP');
    }
  };

  // Notifications
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newNotice = await adminService.createNotification(formInputs);
      setNotifications([newNotice, ...notifications]);
      toast.success('Notice broadcasted successfully!');
      setFormInputs({ type: 'announcement', targetGroup: 'all', title: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send notification');
    }
  };

  // Ticket status
  const handleResolveTicket = async (id: string) => {
    try {
      const updated = await adminService.resolveSupportTicket(id);
      setTickets(tickets.map(t => t._id === id ? { ...t, status: updated.status } : t));
      toast.success('Ticket marked resolved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve ticket');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Delete this support ticket?')) return;
    try {
      await adminService.deleteSupportTicket(id);
      setTickets(tickets.filter(t => t._id !== id));
      toast.success('Ticket deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete ticket');
    }
  };

  // Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await adminService.updateSettings(settings);
      setSettings(updated);
      toast.success('Global platform configurations saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    }
  };

  // Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.updateUser(adminUser.id || adminUser._id, formInputs);
      toast.success('Profile settings updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    }
  };

  // CSV Report Generator Helper
  const handleDownloadCSV = async (type: string) => {
    try {
      const data = await adminService.fetchReportData(type);
      if (!data || !data.length) {
        toast.error('No record found to generate report');
        return;
      }
      
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row: any) => headers.map(fieldName => JSON.stringify(row[fieldName] !== undefined ? row[fieldName] : '')).join(','))
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `swigo_report_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${type.toUpperCase()} report generated and downloaded!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report');
    }
  };

  if (!adminUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-700">
      <Navbar />
      
      <div className="flex">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} />
        
        {/* Main Content Area */}
        <main className="flex-1 bg-white p-8 md:p-12 overflow-x-hidden min-h-[calc(100vh-73px)]">
          
          {/* Header Title */}
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest mb-3">
                Swigo Admin Core
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 capitalize">
                {currentTab.replace('-', ' ')}
              </h1>
              <p className="text-sm font-medium text-slate-400 mt-1">
                Perform administrative checks, approve partners, and configure systems.
              </p>
            </div>
            
            {currentTab === 'dashboard' && (
              <button 
                onClick={handleTriggerSeed}
                className="btn-primary flex items-center gap-2 cursor-pointer"
              >
                🌱 Seed Demo Data
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
          ) : (
            <>
              {/* 1. DASHBOARD OVERVIEW */}
              {currentTab === 'dashboard' && stats && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="card-modern p-8 flex flex-col justify-between h-40">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
                      <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
                      <span className="text-[10px] text-primary font-bold">Standard customers</span>
                    </div>
                    <div className="card-modern p-8 flex flex-col justify-between h-40">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Owners</p>
                      <p className="text-4xl font-black text-white">{stats.totalOwners}</p>
                      <span className="text-[10px] text-primary font-bold">Property managers</span>
                    </div>
                    <div className="card-modern p-8 flex flex-col justify-between h-40">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Partners</p>
                      <p className="text-4xl font-black text-white">{stats.totalTiffinProviders}</p>
                      <span className="text-[10px] text-secondary font-bold">Tiffin kitchens</span>
                    </div>
                    <div className="card-modern p-8 flex flex-col justify-between h-40">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Properties & Rooms</p>
                      <p className="text-4xl font-black text-white">{stats.totalProperties} / {stats.totalRooms}</p>
                      <span className="text-[10px] text-slate-300 font-bold">Listed on app</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Bookings</p>
                      <p className="text-5xl font-black text-slate-800">{stats.totalBookings}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Collabs</p>
                      <p className="text-5xl font-black text-slate-800">{stats.activeCollabs}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 flex flex-col items-center justify-center text-center shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pending Requests</p>
                      <p className="text-5xl font-black text-red-500">{stats.pendingRequests}</p>
                    </div>
                  </div>

                  {/* Live Client Portal Access (User Areas) */}
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-900 text-white text-[9px] font-bold uppercase tracking-widest mb-2">
                          Client Gateways
                        </span>
                        <h2 className="text-xl font-extrabold text-slate-800">🌐 Live Client Portal & User Area Access</h2>
                        <p className="text-xs text-slate-400 font-medium">Instant access, live gateway status, and maintenance toggles for all 3 user areas & backend.</p>
                      </div>
                      <button 
                        onClick={() => pingPortals()}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer shadow-2xs"
                      >
                        🔄 Refresh Ping
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {[
                        { key: 'user', name: 'User Front-End Portal', desc: 'Customer & Student area', port: '3000', url: 'http://localhost:3000', color: 'border-blue-200 bg-blue-50/40 text-blue-700' },
                        { key: 'owner', name: 'Owner Management Portal', desc: 'Property & Room manager area', port: '3001', url: 'http://localhost:3001', color: 'border-purple-200 bg-purple-50/40 text-purple-700' },
                        { key: 'tiffin', name: 'Tiffin Kitchen Portal', desc: 'Food & Meal provider area', port: '3003', url: 'http://localhost:3003', color: 'border-amber-200 bg-amber-50/40 text-amber-700' },
                        { key: 'server', name: 'Backend API Server', desc: 'Core Express API & DB', port: '5000', url: 'http://localhost:5000', color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700' }
                      ].map(p => {
                        const status = portalStatuses[p.key] || 'checking';
                        const isMaintenance = settings ? (
                          p.key === 'user' ? settings.userPortalMaintenance :
                          p.key === 'owner' ? settings.ownerPortalMaintenance :
                          p.key === 'tiffin' ? settings.tiffinPortalMaintenance : false
                        ) : false;

                        return (
                          <div key={p.key} className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${p.color}`}>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70">Port {p.port}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                  status === 'live' ? 'bg-emerald-500 text-white shadow-sm' :
                                  status === 'maintenance' ? 'bg-amber-500 text-white shadow-sm' : 'bg-red-500 text-white animate-pulse shadow-sm'
                                }`}>
                                  {status}
                                </span>
                              </div>
                              <h4 className="text-sm font-black text-slate-800 tracking-tight leading-snug">{p.name}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between gap-2">
                              {p.key !== 'server' && settings ? (
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={!!isMaintenance}
                                    onChange={async (e) => {
                                      const updateObj = { ...settings };
                                      if (p.key === 'user') updateObj.userPortalMaintenance = e.target.checked;
                                      if (p.key === 'owner') updateObj.ownerPortalMaintenance = e.target.checked;
                                      if (p.key === 'tiffin') updateObj.tiffinPortalMaintenance = e.target.checked;
                                      const updated = await adminService.updateSettings(updateObj);
                                      setSettings(updated);
                                      toast.success(`${p.name} Maintenance Mode ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                                      setTimeout(() => pingPortals(updated), 500);
                                    }}
                                    className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                                  />
                                  <span>Maint. Mode</span>
                                </label>
                              ) : (
                                <span className="text-[10px] font-mono font-bold text-emerald-700">API Gateway Online</span>
                              )}

                              <a 
                                href={p.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-800 text-[11px] font-extrabold transition-all shadow-2xs shrink-0"
                              >
                                Launch ↗
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent activities */}
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 shadow-sm">
                    <h2 className="text-xl font-extrabold text-slate-800 mb-6">Recent System Logs</h2>
                    <div className="space-y-4">
                      {stats.activities && stats.activities.length > 0 ? (
                        stats.activities.map((act: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center text-lg">
                                {act.type === 'booking' ? '📅' : '🏠'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{act.title}</p>
                                <p className="text-xs text-slate-400 font-medium">{new Date(act.time).toLocaleString()}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              act.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {act.status}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm font-bold text-slate-400 text-center py-6">No recent actions recorded. Click "Seed Demo Data" above.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. USER MANAGEMENT */}
              {currentTab === 'users' && (
                <div className="space-y-8">
                  {/* Search and Filters */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        placeholder="Search users by name, email, city..." 
                        value={userSearchText} 
                        onChange={(e) => setUserSearchText(e.target.value)}
                        className="input-clean"
                      />
                    </div>
                    <select 
                      value={userRoleFilter} 
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="owner">Owner</option>
                      <option value="tiffin">Tiffin Provider</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Excel Style Table */}
                  <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white border-b border-slate-800">
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">User ID</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Name</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Email</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Phone</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">City</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Status</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Joined Date</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-5 text-xs font-medium text-slate-400 font-mono truncate max-w-28">{u._id}</td>
                            <td className="p-5 text-sm font-bold text-slate-800">{u.name}</td>
                            <td className="p-5 text-sm font-medium text-slate-600">{u.email}</td>
                            <td className="p-5 text-sm font-medium text-slate-600">{u.phone || 'N/A'}</td>
                            <td className="p-5 text-sm font-bold text-slate-700">{u.city || 'Pune'}</td>
                            <td className="p-5">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.status === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {u.status || 'Active'}
                              </span>
                            </td>
                            <td className="p-5 text-sm font-medium text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="p-5 text-right space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedEntity(u);
                                  setFormInputs({ name: u.name, email: u.email, phone: u.phone, city: u.city, status: u.status || 'Active', businessName: u.businessName, kitchenName: u.kitchenName });
                                  setActiveModal('editUser');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedEntity(u);
                                  setFormInputs({ password: '' });
                                  setActiveModal('resetPassword');
                                }}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-amber-600 hover:bg-amber-50 cursor-pointer"
                              >
                                Key
                              </button>
                              <button 
                                onClick={() => handleGenerateOtp(u.email)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-purple-600 hover:bg-purple-50 cursor-pointer"
                                title="Generate OTP"
                              >
                                OTP
                              </button>
                              <button 
                                onClick={() => {
                                  const nextStatus = u.status === 'Suspended' ? 'Active' : 'Suspended';
                                  adminService.updateUser(u._id, { status: nextStatus }).then(res => {
                                    setUsers(users.map(item => item._id === u._id ? res : item));
                                    toast.success(`User is now ${nextStatus}`);
                                  });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                  u.status === 'Suspended' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {u.status === 'Suspended' ? 'Active' : 'Suspend'}
                              </button>
                              <button 
                                onClick={() => handleUserDelete(u._id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Active system OTP codes */}
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-6">Active Security OTP Keys</h3>
                    <div className="space-y-4">
                      {otps.map((o) => (
                        <div key={o._id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{o.email}</p>
                            <p className="text-xs text-slate-400 font-medium">Expires: {new Date(o.expiresAt).toLocaleTimeString()}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-sm font-extrabold px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl">
                              {o.otp}
                            </span>
                            <button 
                              onClick={() => handleDeleteOtp(o._id)}
                              className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                      {otps.length === 0 && (
                        <p className="text-sm font-bold text-slate-400 text-center py-4">No active OTP key logs in the system.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. OWNER MANAGEMENT */}
              {currentTab === 'owners' && (
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Owner ID</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Business Name</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">City</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Rating</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Status</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                      {users.map((owner) => (
                        <tr key={owner._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-xs font-mono text-slate-400">{owner._id}</td>
                          <td className="p-5">
                            <p className="text-sm font-bold text-slate-800">{owner.businessName || 'Elite Stays'}</p>
                            <p className="text-xs text-slate-400">{owner.name} ({owner.email})</p>
                          </td>
                          <td className="p-5 text-sm font-medium text-slate-700">{owner.city || 'Pune'}</td>
                          <td className="p-5 text-sm font-bold text-amber-500">⭐ {owner.rating || '4.5'}</td>
                          <td className="p-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              owner.status === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {owner.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-5 text-right space-x-2">
                            <button 
                              onClick={() => handleOwnerStatus(owner._id, 'Active')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-green-600 hover:bg-green-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleOwnerStatus(owner._id, 'Suspended')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              Suspend
                            </button>
                            <button 
                              onClick={async () => {
                                const list = await adminService.fetchOwnerProperties(owner._id);
                                alert(`Properties owned: \n${list.map((p: any) => `- ${p.title} (${p.city})`).join('\n') || 'No properties listed yet.'}`);
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                            >
                              View Listings
                            </button>
                            <button 
                              onClick={() => {
                                const msg = prompt(`Send system broadcast message to owner ${owner.name}:`);
                                if (msg) toast.success(`Message sent directly to owner dashboard: "${msg}"`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                            >
                              ✉️ Message
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 4. TIFFIN PROVIDER MANAGEMENT */}
              {currentTab === 'tiffins' && (
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Kitchen Name</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Provider Name</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Rating</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Status</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                      {users.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-sm font-bold text-slate-800">{p.kitchenName || 'Tasty Homely Kitchen'}</td>
                          <td className="p-5">
                            <p className="text-sm font-bold text-slate-600">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.email}</p>
                          </td>
                          <td className="p-5 text-sm font-bold text-amber-500">⭐ {p.rating || '4.5'}</td>
                          <td className="p-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === 'Suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {p.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-5 text-right space-x-2">
                            <button 
                              onClick={() => handleTiffinStatus(p._id, 'Active')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-green-600 hover:bg-green-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleTiffinStatus(p._id, 'Suspended')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              Suspend
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  const details = await adminService.fetchTiffinDetails(p._id);
                                  setSelectedEntity(details);
                                  setActiveModal('viewMenu');
                                } catch (e) {
                                  toast.error('No menu initialized for this provider yet');
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                            >
                              View Menu
                            </button>
                            <button 
                              onClick={() => {
                                const msg = prompt(`Broadcast support query message to provider ${p.name}:`);
                                if (msg) toast.success(`Alert dispatched to Provider portal: "${msg}"`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                            >
                              ✉️ Message
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 5. PROPERTY MANAGEMENT */}
              {currentTab === 'properties' && (
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Property ID</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Name</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Owner</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Type</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">City/Area</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Status</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                      {properties.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-xs font-mono text-slate-400">{p._id}</td>
                          <td className="p-5 text-sm font-bold text-slate-800">{p.title}</td>
                          <td className="p-5 text-sm font-medium text-slate-600">{(p.owner as any)?.name || 'Guest'}</td>
                          <td className="p-5 text-sm font-bold text-slate-700">{p.type}</td>
                          <td className="p-5 text-sm font-medium text-slate-600">{p.city} / {p.area}</td>
                          <td className="p-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === 'Hidden' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {p.status || 'Approved'}
                            </span>
                          </td>
                          <td className="p-5 text-right space-x-2">
                            <button 
                              onClick={() => handlePropertyStatus(p._id, 'Approved')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-green-600 hover:bg-green-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handlePropertyStatus(p._id, 'Hidden')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-amber-600 hover:bg-amber-50 cursor-pointer"
                            >
                              Hide
                            </button>
                            <button 
                              onClick={() => handlePropertyDelete(p._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold hover:bg-red-200 cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 6. ROOM MANAGEMENT */}
              {currentTab === 'rooms' && (
                <div className="space-y-8">
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        setFormInputs({ roomNo: '', property: properties[0]?._id || '', type: 'Single', price: '', availability: 'Available', status: 'Active' });
                        setActiveModal('addRoom');
                      }}
                      className="btn-primary cursor-pointer"
                    >
                      🛏️ Add Room
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white border-b border-slate-800">
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Room No</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Property</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Type</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Monthly Price</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Availability</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider">Status</th>
                          <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                        {rooms.map((r) => (
                          <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-5 text-sm font-bold text-slate-800">{r.roomNo}</td>
                            <td className="p-5 text-sm font-medium text-slate-600">{(r.property as any)?.title || 'Green Valley PG'}</td>
                            <td className="p-5 text-sm font-medium text-slate-600">{r.type}</td>
                            <td className="p-5 text-sm font-bold text-slate-800">₹{r.price}</td>
                            <td className="p-5">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                r.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {r.availability}
                              </span>
                            </td>
                            <td className="p-5">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                r.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="p-5 text-right space-x-2">
                              <button 
                                onClick={() => handleToggleRoomAvailability(r)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                              >
                                Toggle Availability
                              </button>
                              <button 
                                onClick={() => handleRoomDelete(r._id)}
                                className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold hover:bg-red-200 cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 7. BOOKING MANAGEMENT */}
              {currentTab === 'bookings' && (
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Booking ID</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Customer</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Property</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Check-In</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Check-Out</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Status</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                      {bookings.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-xs font-mono text-slate-400">{b._id}</td>
                          <td className="p-5">
                            <p className="text-sm font-bold text-slate-800">{(b.user as any)?.name || 'Guest'}</p>
                            <p className="text-xs text-slate-400">{(b.user as any)?.phone || 'N/A'}</p>
                          </td>
                          <td className="p-5 text-sm font-bold text-slate-700">{(b.property as any)?.title || 'Property'}</td>
                          <td className="p-5 text-sm font-medium text-slate-600">{new Date(b.startDate).toLocaleDateString()}</td>
                          <td className="p-5 text-sm font-medium text-slate-600">{new Date(b.endDate).toLocaleDateString()}</td>
                          <td className="p-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              b.status === 'confirmed' || b.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-5 text-right space-x-2">
                            <button 
                              onClick={() => handleBookingStatus(b._id, 'confirmed')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-green-600 hover:bg-green-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleBookingStatus(b._id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => handleBookingStatus(b._id, 'cancelled')}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 8. FOOD MANAGEMENT */}
              {currentTab === 'food' && (
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Meal</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Kitchen Name</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Price per Plate</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Availability</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Simulated Orders</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                      {meals.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5">
                            <p className="text-sm font-bold text-slate-800">{m.meal}</p>
                            <p className="text-xs text-slate-400 font-medium">{m.description || 'Homely prepared food'}</p>
                          </td>
                          <td className="p-5 text-sm font-bold text-slate-700">{m.kitchenName}</td>
                          <td className="p-5 text-sm font-extrabold text-slate-800">₹{m.price}</td>
                          <td className="p-5">
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">
                              {m.availability}
                            </span>
                          </td>
                          <td className="p-5 text-sm font-extrabold text-slate-700">{m.orders} active orders</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 9. COLLABORATION MANAGEMENT */}
              {currentTab === 'collabs' && (
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Owner Name</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Kitchen Name</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Property Name</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Start Date</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Status</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                      {collabs.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-sm font-bold text-slate-800">{(c.owner as any)?.name || 'Owner'}</td>
                          <td className="p-5 text-sm font-bold text-slate-700">{(c.tiffin as any)?.name || 'Kitchen'}</td>
                          <td className="p-5 text-sm font-medium text-slate-600">{(c.property as any)?.title || 'Property'}</td>
                          <td className="p-5 text-sm font-medium text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="p-5">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              c.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              c.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="p-5 text-right space-x-2">
                            <button 
                              onClick={() => handleCollabStatus(c._id, 'accepted')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-green-600 hover:bg-green-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleCollabStatus(c._id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  const ownerId = (c.owner as any)?._id || c.owner;
                                  const providerId = (c.provider as any)?._id || c.provider || (c.tiffin as any)?.provider || (c.tiffin as any)?._id;
                                  const chatLogs = await adminService.fetchCollabChat(ownerId, providerId);
                                  setSelectedEntity({ ...c, chatLogs });
                                  setActiveModal('collabChat');
                                } catch (e: any) {
                                  toast.error(e.message || 'No chat history found');
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                            >
                              💬 Chat Logs
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 10. REVIEW MANAGEMENT */}
              {currentTab === 'reviews' && (
                <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white border-b border-slate-800">
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Review ID</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">User</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Property</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Rating</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider">Comment</th>
                        <th className="p-5 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                      {reviews.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-xs font-mono text-slate-400">{r._id}</td>
                          <td className="p-5 text-sm font-bold text-slate-800">{(r.user as any)?.name || 'Guest'}</td>
                          <td className="p-5 text-sm font-medium text-slate-600">{(r.property as any)?.title || 'Property'}</td>
                          <td className="p-5 text-sm font-bold text-amber-500">⭐ {r.rating} / 5</td>
                          <td className="p-5 text-sm font-medium text-slate-600 italic">"{r.comment}"</td>
                          <td className="p-5 text-right space-x-2">
                            <button 
                              onClick={() => handleReviewDelete(r._id)}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold hover:bg-red-200 cursor-pointer"
                            >
                              Delete Comment
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedEntity(r);
                                setFormInputs({ warning: `Your recent review comment contains inappropriate content. Please write constructive comments.` });
                                setActiveModal('warning');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-amber-600 hover:bg-amber-50 cursor-pointer"
                            >
                              ⚠️ Warn User
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 11. REPORTS & ANALYTICS */}
              {currentTab === 'reports' && (
                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-10 shadow-sm max-w-2xl mx-auto text-center space-y-8">
                  <div>
                    <span className="text-4xl">📊</span>
                    <h2 className="text-2xl font-extrabold text-slate-800 mt-4">Database Report Exporter</h2>
                    <p className="text-slate-400 text-sm mt-1">Export full platform data tables instantly as CSV spreadsheet formats.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'users', label: '👥 Users Report' },
                      { type: 'bookings', label: '📅 Bookings Report' },
                      { type: 'properties', label: '🏠 Properties Report' },
                      { type: 'reviews', label: '⭐ Reviews Report' },
                      { type: 'collabs', label: '🤝 Collabs Report' },
                      { type: 'food', label: '🍽️ Food Services' }
                    ].map(rep => (
                      <button 
                        key={rep.type}
                        onClick={() => handleDownloadCSV(rep.type)}
                        className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 font-bold hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
                      >
                        <span className="text-slate-800">{rep.label}</span>
                        <span className="text-[10px] text-primary uppercase font-extrabold tracking-wider mt-4">Download CSV</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 12. NOTIFICATIONS */}
              {currentTab === 'notifications' && (
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                  {/* Broadcast form */}
                  <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 shadow-sm">
                    <h3 className="text-lg font-extrabold text-slate-800 mb-6">Broadcast Notification</h3>
                    <form onSubmit={handleSendNotification} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notice Type</label>
                          <select 
                            value={formInputs.type || 'announcement'} 
                            onChange={(e) => setFormInputs({ ...formInputs, type: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                          >
                            <option value="announcement">Announcement</option>
                            <option value="maintenance">Maintenance Notice</option>
                            <option value="update">System Update</option>
                            <option value="warning">System Warning</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Group</label>
                          <select 
                            value={formInputs.targetGroup || 'all'} 
                            onChange={(e) => setFormInputs({ ...formInputs, targetGroup: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                          >
                            <option value="all">All Platforms</option>
                            <option value="users">Regular Users</option>
                            <option value="owners">Property Owners</option>
                            <option value="tiffin">Tiffin Providers</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notice Title</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Server Maintenance tonight" 
                          value={formInputs.title || ''}
                          onChange={(e) => setFormInputs({ ...formInputs, title: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Notice Details</label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="Provide descriptive announcement information to display..."
                          value={formInputs.message || ''}
                          onChange={(e) => setFormInputs({ ...formInputs, message: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none"
                        />
                      </div>
                      <button type="submit" className="btn-primary w-full cursor-pointer">
                        🚀 Dispatch Notification
                      </button>
                    </form>
                  </div>

                  {/* Broadcast logs */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-extrabold text-slate-800">Notice Transmission Logs</h3>
                    <div className="space-y-4">
                      {notifications.map((n) => (
                        <div key={n._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                              n.type === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                              n.type === 'warning' ? 'bg-red-100 text-red-800' : 'bg-slate-900 text-white'
                            }`}>
                              {n.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">To: {n.targetGroup}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800 mt-3">{n.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-3 font-medium">Dispatched: {new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <p className="text-sm font-bold text-slate-400 text-center py-6">No previous broadcast log found.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 13. SUPPORT CENTER */}
              {currentTab === 'support' && (
                <div className="space-y-8">
                  {/* Category switcher */}
                  <div className="flex gap-2 border-b border-slate-100 pb-4">
                    {[
                      { id: 'user', label: '👥 User Tickets' },
                      { id: 'owner', label: '🏢 Owner Tickets' },
                      { id: 'kitchen', label: '🍱 Kitchen Tickets' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSupportCategoryFilter(tab.id)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          supportCategoryFilter === tab.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {tickets
                      .filter(t => t.category === supportCategoryFilter)
                      .map((ticket) => (
                        <div key={ticket._id} className="rounded-2xl border border-slate-100 bg-slate-50/30 p-6 flex flex-col justify-between sm:flex-row gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                ticket.status === 'open' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800'
                              }`}>
                                {ticket.status}
                              </span>
                              <h4 className="text-base font-bold text-slate-800">{ticket.title}</h4>
                            </div>
                            <p className="text-sm text-slate-600 font-medium">"{ticket.description}"</p>
                            <p className="text-xs text-slate-400 font-medium">
                              From: {ticket.sender?.name} ({ticket.sender?.email || 'N/A'}) • Raised: {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            {ticket.status === 'open' && (
                              <button 
                                onClick={() => handleResolveTicket(ticket._id)}
                                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                              >
                                Resolve Ticket
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteTicket(ticket._id)}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    {tickets.filter(t => t.category === supportCategoryFilter).length === 0 && (
                      <p className="text-sm font-bold text-slate-400 text-center py-10">No support tickets in this category.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 14. SYSTEM SETTINGS */}
              {currentTab === 'settings' && settings && (
                <form onSubmit={handleSaveSettings} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 shadow-sm max-w-2xl mx-auto space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Platform Name</label>
                      <input 
                        type="text" 
                        value={settings.platformName} 
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary App Theme</label>
                      <select 
                        value={settings.theme} 
                        onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none"
                      >
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Platform Logo URL</label>
                    <input 
                      type="text" 
                      value={settings.logoUrl} 
                      onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mail SMTP Host</label>
                      <input 
                        type="text" 
                        value={settings.emailHost} 
                        onChange={(e) => setSettings({ ...settings, emailHost: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">JWT Session Expiration</label>
                      <input 
                        type="text" 
                        value={settings.jwtExpiration} 
                        onChange={(e) => setSettings({ ...settings, jwtExpiration: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cloud Storage Bucket Name</label>
                      <input 
                        type="text" 
                        value={settings.cloudStorageBucket} 
                        onChange={(e) => setSettings({ ...settings, cloudStorageBucket: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Default Geoposition City</label>
                      <input 
                        type="text" 
                        value={settings.locationDefaultCity} 
                        onChange={(e) => setSettings({ ...settings, locationDefaultCity: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn-primary w-full cursor-pointer">
                    💾 Save Platform Configurations
                  </button>
                </form>
              )}

              {/* PORTAL CONTROL HUB - UPGRADED TO IT MONITORING DASHBOARD */}
              {currentTab === 'portals' && settings && (
                <div className="space-y-10">
                  {/* Top Bar Controls */}
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-widest mb-2">
                        System Operations
                      </span>
                      <h3 className="text-2xl font-black text-slate-800">Master IT Monitoring Dashboard</h3>
                      <p className="text-sm font-medium text-slate-400">Real-time gateway status, CPU/Memory telemetry, and active platform controls.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => pingPortals()}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        🔄 Ping Statuses
                      </button>
                      <button 
                        onClick={startLoadTest}
                        disabled={isLoadTesting}
                        className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                          isLoadTesting 
                            ? 'bg-amber-500 cursor-not-allowed animate-pulse' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        ⚡ {isLoadTesting ? 'Load Testing...' : 'Simulate Load Test'}
                      </button>
                      <button 
                        onClick={() => setDbModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        🗄️ DB Pool Health
                      </button>
                      <button 
                        onClick={() => setLogs([])}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        🗑️ Clear Logs
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      { key: 'server', name: 'Express Backend API Server', port: '5000', url: 'http://localhost:5000', color: 'text-emerald-500', bg: 'bg-emerald-50/30' },
                      { key: 'user', name: 'User Front-End Portal', port: '3000', url: 'http://localhost:3000', color: 'text-blue-500', bg: 'bg-blue-50/30' },
                      { key: 'owner', name: 'Owner Management Portal', port: '3001', url: 'http://localhost:3001', color: 'text-purple-500', bg: 'bg-purple-50/30' },
                      { key: 'tiffin', name: 'Tiffin Kitchen Portal', port: '3003', url: 'http://localhost:3003', color: 'text-amber-500', bg: 'bg-amber-50/30' },
                      { key: 'admin', name: 'Admin Control Center (Current)', port: '3002', url: 'http://localhost:3002', color: 'text-indigo-500', bg: 'bg-indigo-50/30' }
                    ].map(portal => {
                      const status = portalStatuses[portal.key];
                      const stats = liveStats[portal.key] || { latency: 0, cpu: 0, memory: 0, uptime: 'N/A', errorRate: 0 };
                      const keyHistory = history[portal.key] || { cpu: [], latency: [] };

                      return (
                        <div key={portal.key} className={`rounded-3xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${portal.bg}`}>
                          <div>
                            {/* Card Header */}
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-base font-extrabold text-slate-800 tracking-tight leading-tight">{portal.name}</h4>
                                <p className="text-[10px] font-mono text-slate-400 mt-1">Port {portal.port} • {portal.url}</p>
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                status === 'live' ? 'bg-emerald-100 text-emerald-800' :
                                status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800 animate-pulse'
                              }`}>
                                {status}
                              </span>
                            </div>

                            {/* Resource Metrics */}
                            <div className="mt-5 grid grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded-2xl border border-slate-100/80 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CPU Load</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-xl font-black text-slate-800">{stats.cpu}%</span>
                                </div>
                                <div className="mt-1.5 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 ${
                                      stats.cpu > 75 ? 'bg-rose-500' : stats.cpu > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${stats.cpu}%` }}
                                  />
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded-2xl border border-slate-100/80 shadow-2xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Memory (RAM)</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-xl font-black text-slate-800">{stats.memory}%</span>
                                </div>
                                <div className="mt-1.5 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 transition-all duration-500" 
                                    style={{ width: `${stats.memory}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Latency and Mini Chart */}
                            <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-100/80 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latency / Ping</span>
                                <span className={`text-xs font-black ${stats.latency > 150 ? 'text-rose-600' : 'text-slate-700'}`}>
                                  {stats.latency} ms
                                </span>
                              </div>
                              <div className="h-10 flex items-end">
                                {renderSvgGraph(keyHistory.cpu, 100, portal.color)}
                              </div>
                            </div>

                            {/* Uptime and Error Rate info */}
                            <div className="mt-4 flex justify-between text-[11px] font-bold text-slate-500 bg-white/60 px-3 py-2 rounded-xl border border-slate-100/50">
                              <span>Uptime: <span className="text-slate-800">{stats.uptime}</span></span>
                              <span>Errors: <span className={stats.errorRate > 1 ? 'text-rose-600' : 'text-slate-800'}>{stats.errorRate}%</span></span>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="mt-6 border-t border-slate-100/60 pt-4 flex items-center justify-between">
                            {portal.key !== 'admin' && portal.key !== 'server' ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  id={`${portal.key}MaintCheckbox`}
                                  checked={
                                    portal.key === 'user' ? settings.userPortalMaintenance :
                                    portal.key === 'owner' ? settings.ownerPortalMaintenance :
                                    settings.tiffinPortalMaintenance
                                  }
                                  onChange={async (e) => {
                                    const updateObj: any = { ...settings };
                                    if (portal.key === 'user') updateObj.userPortalMaintenance = e.target.checked;
                                    if (portal.key === 'owner') updateObj.ownerPortalMaintenance = e.target.checked;
                                    if (portal.key === 'tiffin') updateObj.tiffinPortalMaintenance = e.target.checked;
                                    
                                    const updated = await adminService.updateSettings(updateObj);
                                    setSettings(updated);
                                    toast.success(`${portal.name} Maintenance Mode ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                                    setTimeout(() => pingPortals(updated), 500);
                                  }}
                                  className="h-4 w-4 rounded text-slate-900 border-slate-200 focus:ring-slate-900 cursor-pointer"
                                />
                                <label htmlFor={`${portal.key}MaintCheckbox`} className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer select-none">
                                  Maintenance Mode
                                </label>
                              </div>
                            ) : portal.key === 'admin' ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  id="adminMaintCheckbox"
                                  checked={settings.adminPortalMaintenance}
                                  onChange={async (e) => {
                                    const updated = await adminService.updateSettings({ ...settings, adminPortalMaintenance: e.target.checked });
                                    setSettings(updated);
                                    toast.success(`Admin Portal Maintenance Mode ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                                    setTimeout(() => pingPortals(updated), 500);
                                  }}
                                  className="h-4 w-4 rounded text-slate-900 border-slate-200 focus:ring-slate-900 cursor-pointer"
                                />
                                <label htmlFor="adminMaintCheckbox" className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer select-none">
                                  Maintenance Mode
                                </label>
                              </div>
                            ) : (
                              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Subsystem API Router</span>
                            )}

                            {portal.key !== 'admin' && (
                              <a 
                                href={portal.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                              >
                                Launch Portal ↗
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Real-time System Console Stream */}
                  <div className="rounded-3xl border border-slate-100 bg-slate-950 text-white p-6 shadow-xl space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        <h4 className="text-sm font-extrabold text-slate-200 font-mono tracking-tight">Active Syslog Transmission Console</h4>
                      </div>
                      
                      {/* Log Source Filter Buttons */}
                      <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl">
                        {[
                          { id: 'all', label: 'ALL STREAMS' },
                          { id: 'server', label: 'SERVER' },
                          { id: 'user', label: 'USER' },
                          { id: 'owner', label: 'OWNER' },
                          { id: 'tiffin', label: 'TIFFIN' },
                          { id: 'admin', label: 'ADMIN' }
                        ].map(btn => (
                          <button
                            key={btn.id}
                            onClick={() => setLogFilter(btn.id)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer font-mono ${
                              logFilter === btn.id 
                                ? 'bg-slate-950 text-white shadow font-black' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scrollable logs box */}
                    <div className="h-64 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1.5 bg-black/40 p-4 rounded-2xl border border-slate-900/50 scrollbar-thin scrollbar-thumb-slate-800">
                      {logs
                        .filter(l => logFilter === 'all' || l.source === logFilter)
                        .map(log => (
                          <div key={log.id} className="flex items-start gap-3 border-b border-slate-900/40 pb-1.5 last:border-0 hover:bg-slate-900/10 px-1 rounded transition-colors">
                            <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                            <span className={`font-bold select-none uppercase w-12 truncate ${
                              log.source === 'server' ? 'text-emerald-500' :
                              log.source === 'user' ? 'text-blue-500' :
                              log.source === 'owner' ? 'text-purple-500' :
                              log.source === 'tiffin' ? 'text-amber-500' : 'text-indigo-500'
                            }`}>
                              {log.source}:
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold select-none uppercase ${
                              log.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold' :
                              log.type === 'warn' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-extrabold' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {log.type}
                            </span>
                            <span className={`flex-1 ${
                              log.type === 'error' ? 'text-red-400 font-semibold animate-pulse' :
                              log.type === 'warn' ? 'text-amber-400' :
                              'text-slate-300'
                            }`}>
                              {log.message}
                            </span>
                          </div>
                        ))}
                      {logs.filter(l => logFilter === 'all' || l.source === logFilter).length === 0 && (
                        <p className="text-slate-500 italic text-center py-10">No logs stream captured matching this active filter channel.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 15. PROFILE SETTINGS */}
              {currentTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-100 bg-slate-50/50 p-8 shadow-sm max-w-xl mx-auto space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Admin Full Name</label>
                    <input 
                      type="text" 
                      value={formInputs.name}
                      onChange={(e) => setFormInputs({ ...formInputs, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      value={adminUser.email}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-400 outline-none"
                    />
                    <span className="text-[10px] font-bold text-slate-400 mt-1 block">Account emails cannot be altered.</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact Phone</label>
                      <input 
                        type="text" 
                        value={formInputs.phone}
                        onChange={(e) => setFormInputs({ ...formInputs, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Default City</label>
                      <input 
                        type="text" 
                        value={formInputs.city}
                        onChange={(e) => setFormInputs({ ...formInputs, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Administrator Biography</label>
                    <textarea 
                      rows={3}
                      value={formInputs.bio}
                      onChange={(e) => setFormInputs({ ...formInputs, bio: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full cursor-pointer">
                    💾 Save Profile Details
                  </button>
                </form>
              )}
            </>
          )}

        </main>
      </div>

      {/* MODALS */}
      {activeModal === 'editUser' && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-slate-800">Edit System User Details</h3>
            <form onSubmit={handleUserUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formInputs.name || ''} 
                  onChange={(e) => setFormInputs({ ...formInputs, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formInputs.email || ''} 
                  onChange={(e) => setFormInputs({ ...formInputs, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={formInputs.phone || ''} 
                  onChange={(e) => setFormInputs({ ...formInputs, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location City</label>
                <input 
                  type="text" 
                  value={formInputs.city || ''} 
                  onChange={(e) => setFormInputs({ ...formInputs, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                />
              </div>
              {selectedEntity.role === 'owner' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Name</label>
                  <input 
                    type="text" 
                    value={formInputs.businessName || ''} 
                    onChange={(e) => setFormInputs({ ...formInputs, businessName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              )}
              {selectedEntity.role === 'tiffin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kitchen Name</label>
                  <input 
                    type="text" 
                    value={formInputs.kitchenName || ''} 
                    onChange={(e) => setFormInputs({ ...formInputs, kitchenName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1 cursor-pointer">Save Changes</button>
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'resetPassword' && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-slate-800">Reset User Password</h3>
            <form onSubmit={handleUserPasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Secure Password</label>
                <input 
                  type="password" 
                  placeholder="At least 6 characters"
                  required
                  value={formInputs.password || ''} 
                  onChange={(e) => setFormInputs({ ...formInputs, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1 cursor-pointer">Update Password</button>
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'viewMenu' && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">{selectedEntity.tiffin?.name}</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Kitchen Menu Configurations</p>
            </div>
            
            <div className="max-h-90 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Meal Plans</h4>
                <div className="space-y-2">
                  {selectedEntity.mealPlans?.map((plan: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{plan.name}</p>
                        <p className="text-xs text-slate-500">{plan.description}</p>
                      </div>
                      <span className="font-extrabold text-slate-700 text-sm">₹{plan.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Weekly Schedule</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  {Object.keys(selectedEntity.menu || {}).map((day) => (
                    <div key={day} className="p-2 bg-slate-50/50 rounded-lg capitalize border border-slate-100/50">
                      <span className="text-slate-400 font-bold block">{day}</span>
                      <span className="text-slate-700">{selectedEntity.menu[day] || 'No custom items'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button type="button" onClick={() => setActiveModal(null)} className="btn-primary w-full cursor-pointer">Close details</button>
          </div>
        </div>
      )}

      {activeModal === 'addRoom' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-slate-800">Add New Property Room</h3>
            <form onSubmit={handleRoomCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room No</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 101-A"
                    value={formInputs.roomNo || ''} 
                    onChange={(e) => setFormInputs({ ...formInputs, roomNo: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room Type</label>
                  <select 
                    value={formInputs.type || 'Single'} 
                    onChange={(e) => setFormInputs({ ...formInputs, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Property Link</label>
                <select 
                  value={formInputs.property || ''} 
                  onChange={(e) => setFormInputs({ ...formInputs, property: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
                >
                  {properties.map(p => (
                    <option key={p._id} value={p._id}>{p.title} ({p.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monthly Rent (₹)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="6500"
                    value={formInputs.price || ''} 
                    onChange={(e) => setFormInputs({ ...formInputs, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Availability</label>
                  <select 
                    value={formInputs.availability || 'Available'} 
                    onChange={(e) => setFormInputs({ ...formInputs, availability: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="btn-primary flex-1 cursor-pointer">Register Room</button>
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'warning' && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-extrabold text-slate-800">Send System Warning</h3>
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-500">
                This will send a warning alert to customer <strong>{(selectedEntity.user as any)?.name}</strong> regarding their review rating comment.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Warning Message</label>
                <textarea 
                  rows={3}
                  value={formInputs.warning || ''} 
                  onChange={(e) => setFormInputs({ ...formInputs, warning: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    adminService.createNotification({
                      type: 'warning',
                      targetGroup: 'users',
                      title: `Inappropriate Content Warning`,
                      message: `In response to your review comment: ${formInputs.warning}`
                    }).then(() => {
                      toast.success('Warning dispatch successful');
                      setActiveModal(null);
                    });
                  }}
                  className="btn-primary flex-1 cursor-pointer"
                >
                  Send Warning
                </button>
                <button type="button" onClick={() => setActiveModal(null)} className="btn-secondary cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'collabChat' && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800">Collaboration Chat History</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Between {selectedEntity.owner?.name || 'Owner'} & {selectedEntity.provider?.name || 'Kitchen'}</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
              {selectedEntity.chatLogs && selectedEntity.chatLogs.length > 0 ? (
                selectedEntity.chatLogs.map((msg: any) => {
                  const isOwner = msg.sender?._id === selectedEntity.owner?._id || msg.sender === selectedEntity.owner?._id;
                  return (
                    <div key={msg._id} className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}>
                      <div className={`p-3 rounded-2xl max-w-sm ${isOwner ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-200 text-slate-800 rounded-tl-none'}`}>
                        <p className="text-sm font-medium">{msg.content}</p>
                        {msg.mealDetails && (
                          <div className="mt-2 text-xs border-t border-white/25 pt-1">
                            <p className="font-bold">🍱 {msg.mealDetails.name}</p>
                            <p className="opacity-90">{msg.mealDetails.description}</p>
                          </div>
                        )}
                        {msg.pricingDetails && (
                          <div className="mt-2 text-xs border-t border-white/25 pt-1">
                            <p className="font-bold">💰 {msg.pricingDetails.planName}</p>
                            <p className="opacity-90">₹{msg.pricingDetails.price} / {msg.pricingDetails.billingCycle}</p>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {msg.sender?.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-6 font-bold">No chat history records found in database.</p>
              )}
            </div>
            
            <button type="button" onClick={() => setActiveModal(null)} className="btn-primary w-full cursor-pointer">Close Chat Logs</button>
          </div>
        </div>
      )}

      {/* DB Pool Health check modal */}
      {dbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🗄️</span>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800">Database Connection Pool</h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">MongoDB Cluster Diagnostics</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Pool Cluster Status</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 font-extrabold">
                  {dbStats.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Max Pool Size</span>
                  <p className="text-2xl font-black text-slate-800 mt-1">{dbStats.poolSize}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Connections</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{dbStats.activeConnections}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Idle Connections</span>
                  <p className="text-2xl font-black text-slate-600 mt-1">{dbStats.idleConnections}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Query Response</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{dbStats.queryLatency}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Total Indexed Documents</span>
                <span className="font-mono text-slate-800">{dbStats.totalDocuments}</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setDbModalOpen(false)} 
              className="btn-primary w-full cursor-pointer"
            >
              Dismiss Diagnostics
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading Admin Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
