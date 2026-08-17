/**
 * Customer storefront cart store.
 * Completely independent from the POS posStore.
 * Items in this cart are AVAILABLE inventory pieces the customer
 * wants to reserve — no financial data, no gold prices computed here.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PublicProduct } from "@/lib/publicApi";

export interface CustomerCartItem extends PublicProduct {
  addedAt: string;
}

interface CustomerCartState {
  items: CustomerCartItem[];
  addItem: (product: PublicProduct) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  clear: () => void;
}

export const useCustomerCart = create<CustomerCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (get().hasItem(product.id)) return;
        set((state) => ({
          items: [
            ...state.items,
            { ...product, addedAt: new Date().toISOString() },
          ],
        }));
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      hasItem: (id) => get().items.some((i) => i.id === id),

      clear: () => set({ items: [] }),
    }),
    {
      name: "almasa-customer-cart",
    }
  )
);
