import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { api, TOKEN_KEY, USER_KEY } from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  /** Creates the account and signs the new user straight in. */
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw && localStorage.getItem(TOKEN_KEY) ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.register({ name, email, password });
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
