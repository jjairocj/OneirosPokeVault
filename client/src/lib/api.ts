const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let accessToken: string | null = null;
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    accessToken = data.accessToken;
    return data.accessToken;
  } catch {
    return null;
  }
}

function processRefreshQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle token expiration
  if (res.status === 401) {
    const body = await res.clone().json().catch(() => ({}));

    if (body.code === 'TOKEN_EXPIRED') {
      if (isRefreshing) {
        // Wait for the ongoing refresh
        const newToken = await new Promise<string | null>((resolve) => {
          refreshQueue.push(resolve);
        });

        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          res = await fetch(url, { ...options, headers, credentials: 'include' });
        }
      } else {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        processRefreshQueue(newToken);

        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          res = await fetch(url, { ...options, headers, credentials: 'include' });
        }
      }
    }
  }

  return res;
}
