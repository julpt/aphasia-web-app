import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { API_BASE_URL } from '../api/config';

type Role = 'USER' | 'ADMIN';

interface AuthState {
  authenticated: boolean;
  email: string | null;
  role: Role | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
      const data = await res.json();
      const isAuthenticated = data.authenticated === 'true';
      setAuthenticated(isAuthenticated);
      setEmail(isAuthenticated ? data.email : null);
      setRole(isAuthenticated ? (data.role as Role) : null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setAuthenticated(false);
    setEmail(null);
    setRole(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ authenticated, email, role, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth trebuie folosit în interiorul AuthProvider');
  return ctx;
}