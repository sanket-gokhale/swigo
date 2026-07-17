const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  if (process.env.API_BASE) return process.env.API_BASE;
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing via local network IP (e.g. 192.168.x.x), use it for API requests
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.vercel.app') && !hostname.endsWith('.onrender.com')) {
      return `http://${hostname}:5000/api`;
    }
  }
  return 'http://127.0.0.1:5000/api';
};

export const API_BASE = getApiBase();

export function handleAuthError(res: Response) {
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

function getAuthHeaders(body?: any): HeadersInit {
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export async function getJSON(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function getAuthJSON(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getAuthHeaders()
  });
  handleAuthError(res);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function postJSON(path: string, body: any) {
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: isFormData ? body : JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function postAuthJSON(path: string, body: any) {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(body),
    body: isFormData ? body : JSON.stringify(body)
  });
  handleAuthError(res);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function putAuthJSON(path: string, body: any) {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(body),
    body: isFormData ? body : JSON.stringify(body)
  });
  handleAuthError(res);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function patchAuthJSON(path: string, body?: any) {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: getAuthHeaders(body),
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });
  handleAuthError(res);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function deleteAuthJSON(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  handleAuthError(res);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
