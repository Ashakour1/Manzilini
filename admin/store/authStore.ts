import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  token: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setHydrated: () => void;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isHydrated: false,
  login: () => {},
  logout: () => {},
  setHydrated: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      isLoggedIn: false,
      login: (user: User) => set({ user, isLoggedIn: true, isHydrated: true }),
      logout: () => set({ user: null, isLoggedIn: false, isHydrated: true }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "m_store",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
