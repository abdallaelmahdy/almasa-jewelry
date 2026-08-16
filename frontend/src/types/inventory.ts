export type ItemStatus = "AVAILABLE" | "SOLD" | "LOCKED" | "RETURNED";

export interface CategoryOut {
  id: number;
  name: string;
}

export interface ProductOut {
  id: number;
  category_id: number;
  name: string;
  sku_prefix: string;
  category: CategoryOut;
}

export interface InventoryItemOut {
  id: string; // UUID
  sku: string;
  status: ItemStatus;
  created_at: string;
  updated_at: string | null;
  locked_by_id: number | null;
  locked_at: string | null;
  weight: string; // Decimal string
  manufacturing_fee: string; // Decimal string
  cost_basis: string; // Decimal string
  product: ProductOut;
  karat: number;
}

export interface InventoryItemCreate {
  product_id: number;
  weight: string; // Decimal string from frontend
  karat: number;
  manufacturing_fee: string; // Decimal string
  cost_basis: string; // Decimal string
}

export interface InventoryTransitionRequest {
  reason: string;
  reference_id?: string | null;
  reference_type?: string | null;
}
