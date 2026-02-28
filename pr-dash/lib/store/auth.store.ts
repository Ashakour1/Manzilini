import { create } from "zustand";
import { persist } from "zustand/middleware";

const AUTH_COOKIE = "auth_token";

function setAuthCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (!token) {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export interface AuthUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  setHydrated: () => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setAuth: (token: string | null, user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
      login: (token, user) => {
        setAuthCookie(token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ token, user });
      },
      logout: () => {
        setAuthCookie(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
      },
      setAuth: (token, user) => {
        if (token) setAuthCookie(token);
        else setAuthCookie(null);
        set({ token, user });
      },
    }),
    {
      name: "auth-storage",
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof document !== "undefined") {
          setAuthCookie(state.token);
        }
      },
    }
  )
);
