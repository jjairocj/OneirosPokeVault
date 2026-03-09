import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiFetch, setAccessToken } from '../lib/api';

interface User {
  id: number;
  email: string;
  plan: 'free' | 'pro';
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const handleAuthLogout = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }

    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }

    const data = await res.json();
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
