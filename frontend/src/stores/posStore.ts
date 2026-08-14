import { create } from 'zustand';
import { InventoryItemOut } from '@/types/inventory';
import { PaymentInput, SaleOut } from '@/types/sales';

function generateIdempotencyKey() {
  return crypto.randomUUID();
}

interface POSState {
  cartItems: InventoryItemOut[];
  customerId: number | null;
  customerName: string | null;
  payments: PaymentInput[];
  idempotencyKey: string;
  completedSale: SaleOut | null;

  // Actions
  addItem: (item: InventoryItemOut) => void;
  removeItem: (itemId: string) => void;
  setCustomer: (id: number | null, name: string | null) => void;
  addPayment: (payment: PaymentInput) => void;
  removePayment: (index: number) => void;
  setCompletedSale: (sale: SaleOut | null) => void;
  clearCart: () => void;
  resetIdempotencyKey: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cartItems: [],
  customerId: null,
  customerName: null,
  payments: [],
  idempotencyKey: generateIdempotencyKey(),
  completedSale: null,

  addItem: (item) =>
    set((state) => {
      // Prevent duplicates
      if (state.cartItems.some((i) => i.id === item.id)) {
        return state;
      }
      return { cartItems: [...state.cartItems, item] };
    }),

  removeItem: (itemId) =>
    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.id !== itemId),
    })),

  setCustomer: (id, name) =>
    set(() => ({
      customerId: id,
      customerName: name,
    })),

  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, payment],
    })),

  removePayment: (index) =>
    set((state) => ({
      payments: state.payments.filter((_, i) => i !== index),
    })),

  setCompletedSale: (sale) =>
    set(() => ({
      completedSale: sale,
    })),

  clearCart: () =>
    set(() => ({
      cartItems: [],
      customerId: null,
      customerName: null,
      payments: [],
      idempotencyKey: generateIdempotencyKey(), // Generate a new key for the next completely new cart
    })),

  resetIdempotencyKey: () =>
    set(() => ({
      idempotencyKey: generateIdempotencyKey(),
    })),
}));
