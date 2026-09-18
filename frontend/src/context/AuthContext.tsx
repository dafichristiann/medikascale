import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loginRequest } from '@/api/auth';
import type { AuthenticatedUser } from '@/types';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  /** Cek apakah user yang sedang login punya permission tertentu, mis. "antrian.prioritaskan". */
  hasPermission: (permissionKode: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_USER_KEY = 'medikascale_user';
const STORAGE_TOKEN_KEY = 'medikascale_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Pulihkan sesi dari localStorage saat aplikasi dibuka ulang.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const { token, user: loggedInUser } = await loginRequest(username, password);
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  }

  function hasPermission(permissionKode: string): boolean {
    return user?.permissions.includes(permissionKode) ?? false;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}
