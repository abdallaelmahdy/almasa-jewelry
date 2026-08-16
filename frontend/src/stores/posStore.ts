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
  goldPrices: Record<number, number>; // karat -> price_per_gram
  cartTotal: number;

  // Actions
  addItem: (item: InventoryItemOut) => void;
  removeItem: (itemId: string) => void;
  setCustomer: (id: number | null, name: string | null) => void;
  addPayment: (payment: PaymentInput) => void;
  removePayment: (index: number) => void;
  setCompletedSale: (sale: SaleOut | null) => void;
  clearCart: () => void;
  resetIdempotencyKey: () => void;
  setGoldPrices: (prices: Record<number, number>) => void;
  recalculateTotal: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cartItems: [],
  customerId: null,
  customerName: null,
  payments: [],
  idempotencyKey: generateIdempotencyKey(),
  completedSale: null,
  goldPrices: {},
  cartTotal: 0,

  addItem: (item) =>
    set((state) => {
      // Prevent duplicates
      if (state.cartItems.some((i) => i.id === item.id)) {
        return state;
      }
      const newItems = [...state.cartItems, item];
      // Optimistic total calculation
      const total = newItems.reduce((sum, i) => {
        const price = state.goldPrices[i.karat] || 0;
        return sum + (price * parseFloat(i.weight)) + parseFloat(i.manufacturing_fee);
      }, 0);
      return { cartItems: newItems, cartTotal: total };
    }),

  removeItem: (itemId) =>
    set((state) => {
      const newItems = state.cartItems.filter((i) => i.id !== itemId);
      const total = newItems.reduce((sum, i) => {
        const price = state.goldPrices[i.karat] || 0;
        return sum + (price * parseFloat(i.weight)) + parseFloat(i.manufacturing_fee);
      }, 0);
      return { cartItems: newItems, cartTotal: total };
    }),

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
      cartTotal: 0,
      idempotencyKey: generateIdempotencyKey(), // Generate a new key for the next completely new cart
    })),

  resetIdempotencyKey: () =>
    set(() => ({
      idempotencyKey: generateIdempotencyKey(),
    })),

  setGoldPrices: (prices) =>
    set((state) => {
      const total = state.cartItems.reduce((sum, i) => {
        const price = prices[i.karat] || 0;
        return sum + (price * parseFloat(i.weight)) + parseFloat(i.manufacturing_fee);
      }, 0);
      return { goldPrices: prices, cartTotal: total };
    }),

  recalculateTotal: () =>
    set((state) => {
      const total = state.cartItems.reduce((sum, i) => {
        const price = state.goldPrices[i.karat] || 0;
        return sum + (price * parseFloat(i.weight)) + parseFloat(i.manufacturing_fee);
      }, 0);
      return { cartTotal: total };
    }),
}));
