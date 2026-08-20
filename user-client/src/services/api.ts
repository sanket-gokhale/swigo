const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
  if (process.env.API_BASE) return process.env.API_BASE;
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Check if hostname is local
    const isLocal = hostname === 'localhost' || 
                    hostname === '127.0.0.1' || 
                    hostname.startsWith('192.168.') || 
                    hostname.startsWith('10.') || 
                    hostname.startsWith('172.');
                    
    if (!isLocal) {
      // If it's a deployed production app, route to the Render backend
      return 'https://swigo.onrender.com/api';
    } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // If it's a local network IP, route to the local backend using the same IP
      return `http://${hostname}:5000/api`;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://swigo.onrender.com/api';
  }

  return 'http://localhost:5000/api';
};

export const API_BASE = getApiBase();

// In-Memory Fast Response Cache
interface CacheEntry {
  data: any;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh cache

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(prefix)) {
      apiCache.delete(key);
    }
  }
}

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

export async function getJSON(path: string, options: { useCache?: boolean; forceFresh?: boolean } = { useCache: true }) {
  const cacheKey = path;
  const now = Date.now();
  
  if (options.useCache !== false && !options.forceFresh) {
    const cached = apiCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      // If we have stale cache, return it on error rather than crashing
      const cached = apiCache.get(cacheKey);
      if (cached) return cached.data;
      throw new Error(`API error ${res.status}`);
    }
    const data = await res.json();
    
    if (options.useCache !== false) {
      apiCache.set(cacheKey, { data, timestamp: now });
    }
    return data;
  } catch (err: any) {
    const cached = apiCache.get(cacheKey);
    if (cached) return cached.data;
    throw err;
  }
}

export async function getAuthJSON(path: string, options: { useCache?: boolean } = { useCache: true }) {
  const cacheKey = `auth:${path}`;
  const now = Date.now();
  
  if (options.useCache !== false) {
    const cached = apiCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: getAuthHeaders()
    });
    handleAuthError(res);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();

    if (options.useCache !== false) {
      apiCache.set(cacheKey, { data, timestamp: now });
    }
    return data;
  } catch (err: any) {
    const cached = apiCache.get(cacheKey);
    if (cached) return cached.data;
    throw err;
  }
}

export async function postJSON(path: string, body: any) {
  clearApiCache();
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
  clearApiCache();
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
  clearApiCache();
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
  clearApiCache();
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
  clearApiCache();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  handleAuthError(res);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
