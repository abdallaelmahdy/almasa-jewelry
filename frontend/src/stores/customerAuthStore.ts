/**
 * Customer storefront auth store.
 * Re-uses the same JWT flow as employee auth but tracks the customer identity separately.
 * Customer login still calls /auth/login — the JWT payload role="customer" distinguishes them.
 */
import { create } from "zustand";

export interface CustomerUser {
  id: number;
  username: string;
  email: string;
  role: "customer";
  is_active: boolean;
}

interface CustomerAuthState {
  customer: CustomerUser | null;
  accessToken: string | null;
  setAuth: (customer: CustomerUser, token: string) => void;
  clearAuth: () => void;
}

export const useCustomerAuth = create<CustomerAuthState>()((set) => ({
  customer: null,
  accessToken: null,
  setAuth: (customer, token) => set({ customer, accessToken: token }),
  clearAuth: () => set({ customer: null, accessToken: null }),
}));
