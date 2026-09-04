"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiRequestError } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import type { AuthUser } from "@/types/api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: AuthUser }>("/auth/me");
      setUser(data.user);
      if (data.user.emailVerified) connectSocket();
      return data.user;
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        try {
          const refreshed = await api<{ user: AuthUser }>("/auth/refresh", { method: "POST" });
          setUser(refreshed.user);
          if (refreshed.user.emailVerified) connectSocket();
          return refreshed.user;
        } catch {
          setUser(null);
          disconnectSocket();
          return null;
        }
      }
      setUser(null);
      disconnectSocket();
      return null;
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    disconnectSocket();
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, logout, setUser }),
    [user, loading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
