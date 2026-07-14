import { API_BASE } from './api';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

// 1. Stats
export async function fetchStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return (await res.json()).data;
}

// 2. Users
export async function fetchUsers(role?: string, search?: string) {
  let url = `${API_BASE}/admin/users`;
  const params = [];
  if (role) params.push(`role=${role}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length) url += `?${params.join('&')}`;
  
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch users');
  return (await res.json()).data;
}

export async function updateUser(id: string, data: any) {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update user');
  return (await res.json()).data;
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return await res.json();
}

export async function resetUserPassword(id: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/users/${id}/reset-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ password })
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to reset password');
  return await res.json();
}

// 3. Owners
export async function updateOwnerStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/admin/owners/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update owner status');
  return (await res.json()).data;
}

export async function fetchOwnerProperties(id: string) {
  const res = await fetch(`${API_BASE}/admin/owners/${id}/properties`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch owner properties');
  return (await res.json()).data;
}

// 4. Tiffins
export async function updateTiffinStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE}/admin/tiffins/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update tiffin status');
  return (await res.json()).data;
}

export async function fetchTiffinDetails(id: string) {
  const res = await fetch(`${API_BASE}/admin/tiffins/${id}/details`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch tiffin details');
  return (await res.json()).data;
}

// 5. Properties
export async function fetchPropertiesAdmin() {
  const res = await fetch(`${API_BASE}/admin/properties`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch properties');
  return (await res.json()).data;
}

export async function updatePropertyAdmin(id: string, data: any) {
  const res = await fetch(`${API_BASE}/admin/properties/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update property');
  return (await res.json()).data;
}

export async function deletePropertyAdmin(id: string) {
  const res = await fetch(`${API_BASE}/admin/properties/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete property');
  return await res.json();
}

// 6. Rooms
export async function fetchRooms() {
  const res = await fetch(`${API_BASE}/admin/rooms`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch rooms');
  return (await res.json()).data;
}

export async function createRoom(data: any) {
  const res = await fetch(`${API_BASE}/admin/rooms`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create room');
  return (await res.json()).data;
}

export async function updateRoom(id: string, data: any) {
  const res = await fetch(`${API_BASE}/admin/rooms/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update room');
  return (await res.json()).data;
}

export async function deleteRoom(id: string) {
  const res = await fetch(`${API_BASE}/admin/rooms/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete room');
  return await res.json();
}

// 7. Bookings
export async function fetchBookingsAdmin() {
  const res = await fetch(`${API_BASE}/admin/bookings`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return (await res.json()).data;
}

export async function updateBookingStatusAdmin(id: string, status: string) {
  const res = await fetch(`${API_BASE}/admin/bookings/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update booking');
  return (await res.json()).data;
}

// 8. Food / Meals
export async function fetchMeals() {
  const res = await fetch(`${API_BASE}/admin/meals`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch meals');
  return (await res.json()).data;
}

// 9. Collabs
export async function fetchCollabsAdmin() {
  const res = await fetch(`${API_BASE}/admin/collabs`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch collaborations');
  return (await res.json()).data;
}

export async function updateCollabStatusAdmin(id: string, status: string) {
  const res = await fetch(`${API_BASE}/admin/collabs/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update collaboration');
  return (await res.json()).data;
}

export async function fetchCollabChat(ownerId: string, providerId: string) {
  const res = await fetch(`${API_BASE}/admin/collabs/chat?ownerId=${ownerId}&providerId=${providerId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch chat logs');
  return (await res.json()).data;
}

// 10. Reviews
export async function fetchReviewsAdmin() {
  const res = await fetch(`${API_BASE}/admin/reviews`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return (await res.json()).data;
}

export async function deleteReviewAdmin(id: string) {
  const res = await fetch(`${API_BASE}/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete review');
  return await res.json();
}

// 11. Reports & Analytics
export async function fetchReportData(type: string) {
  const res = await fetch(`${API_BASE}/admin/reports/${type}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch report');
  return (await res.json()).data;
}

// 12. Notifications
export async function fetchNotifications() {
  const res = await fetch(`${API_BASE}/admin/notifications`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return (await res.json()).data;
}

export async function createNotification(data: any) {
  const res = await fetch(`${API_BASE}/admin/notifications`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to send notification');
  return (await res.json()).data;
}

// 13. Support tickets
export async function fetchSupportTickets() {
  const res = await fetch(`${API_BASE}/admin/tickets`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch support tickets');
  return (await res.json()).data;
}

export async function createSupportTicket(data: any) {
  const res = await fetch(`${API_BASE}/admin/tickets`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return (await res.json()).data;
}

export async function resolveSupportTicket(id: string) {
  const res = await fetch(`${API_BASE}/admin/tickets/${id}/resolve`, {
    method: 'PUT',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to resolve ticket');
  return (await res.json()).data;
}

export async function deleteSupportTicket(id: string) {
  const res = await fetch(`${API_BASE}/admin/tickets/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete ticket');
  return await res.json();
}

// 14. Settings
export async function fetchSettings() {
  const res = await fetch(`${API_BASE}/admin/settings`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return (await res.json()).data;
}

export async function updateSettings(data: any) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return (await res.json()).data;
}

// OTPs
export async function fetchOtps() {
  const res = await fetch(`${API_BASE}/admin/otps`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch OTPs');
  return (await res.json()).data;
}

export async function createOtp(email: string) {
  const res = await fetch(`${API_BASE}/admin/otps`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error('Failed to generate OTP');
  return (await res.json()).data;
}

export async function deleteOtp(id: string) {
  const res = await fetch(`${API_BASE}/admin/otps/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete OTP');
  return await res.json();
}

// DB Seed
export async function triggerDbSeed() {
  const res = await fetch(`${API_BASE}/admin/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Database seeding failed');
  return await res.json();
}
