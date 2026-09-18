import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loginRequest } from '@/api/auth';
import { USE_MOCK } from '@/api/client';
import { MOCK_USERS } from '@/data/mockData';
import type { AuthenticatedUser } from '@/types';

interface AuthContextValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  selectDemoUser: (user: AuthenticatedUser) => Promise<void>;
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

  // Sesi demo dipilih melalui halaman pemilih role. Guard permission tetap
  // aktif karena profil terpilih menyimpan daftar permission role tersebut.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_USER_KEY);
    let hasRestoredSession = false;

    if (stored) {
      try {
        setUser(JSON.parse(stored));
        hasRestoredSession = true;
      } catch {
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    }
    if (!hasRestoredSession) setUser(null);
    setLoading(false);
  }, []);

  async function login(username: string, password: string) {
    const { token, user: loggedInUser } = await loginRequest(username, password);
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  async function selectDemoUser(demoUser: AuthenticatedUser) {
    if (!USE_MOCK) {
      try {
        const result = await loginRequest(demoUser.username, 'demo123');
        localStorage.setItem(STORAGE_TOKEN_KEY, result.token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(result.user));
        setUser(result.user);
      } catch {
        // Role cards remain usable when the backend is offline or the demo
        // account has not been seeded yet. API-backed pages will show their
        // normal auth/error state until the backend is available.
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
      }
      return;
    }
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
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
    <AuthContext.Provider value={{ user, loading, login, selectDemoUser, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}
