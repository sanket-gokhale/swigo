import { API_BASE } from './api';

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Login failed');
  
  if (result.data && result.data.token) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  return result;
}

export async function register(name: string, email: string, password: string, role?: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || 'Registration failed');
  
  if (result.data && result.data.token) {
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
  }
  return result;
}

export async function getProfile() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: { 
      'Authorization': `Bearer ${token}` 
    },
  });

  if (res.status === 401) {
    logout();
    return null;
  }
  const result = await res.json();
  if (res.ok && result.data) {
    localStorage.setItem('user', JSON.stringify(result.data));
    return result.data;
  }
  return null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error requesting reset');
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error resetting password');
  return data;
}

export function isAuthenticated() {
  return !!getToken();
}
