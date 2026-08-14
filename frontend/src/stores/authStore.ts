import { create } from "zustand";
import { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setInitialized: (val: boolean) => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,
  setAuth: (user, token) => set({ user, accessToken: token, isInitialized: true }),
  clearAuth: () => set({ user: null, accessToken: null, isInitialized: true }),
  setInitialized: (val) => set({ isInitialized: val }),
  setAccessToken: (token) => set({ accessToken: token }),
}));
