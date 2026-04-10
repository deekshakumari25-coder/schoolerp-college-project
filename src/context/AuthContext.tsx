/* eslint-disable react-refresh/only-export-components -- AuthContext exported with Provider */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { UserMe } from '@/types/auth';

export const AuthContext = createContext({
  token: null as string | null,
  user: null as UserMe | null,
  loading: true,
  login: (() => {}) as (token: string, user: UserMe) => void,
  logout: () => {},
  refreshMe: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const t = localStorage.getItem('token');
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<UserMe>('/api/auth/me');
      setUser(data);
      setToken(t);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) setToken(saved);
    refreshMe();
  }, [refreshMe]);

  const login = (newToken: string, u: UserMe) => {
    setToken(newToken);
    setUser(u);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
};
