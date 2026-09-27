"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { API_BROWSER } from "@/lib/api";

type User = { id: number; email: string; full_name: string; role: string; city: string | null };

type AuthCtx = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; full_name: string; city?: string }) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(Ctx);
const KEY = "handup_token";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const loadUser = useCallback(async (t: string) => {
    const res = await fetch(`${API_BROWSER}/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
    if (!res.ok) throw new Error("auth");
    setUser(await res.json());
  }, []);

  useEffect(() => {
    const t = localStorage.getItem(KEY);
    if (!t) return setReady(true);
    setToken(t);
    loadUser(t)
      .catch(() => localStorage.removeItem(KEY))
      .finally(() => setReady(true));
  }, [loadUser]);

  const auth = async (path: string, body: unknown) => {
    const res = await fetch(`${API_BROWSER}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail ?? "error");
    localStorage.setItem(KEY, data.access_token);
    setToken(data.access_token);
    await loadUser(data.access_token);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        token,
        ready,
        login: (email, password) => auth("login", { email, password }),
        register: (p) => auth("register", p),
        logout: () => {
          localStorage.removeItem(KEY);
          setToken(null);
          setUser(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
