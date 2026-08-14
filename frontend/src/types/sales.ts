export interface PaymentInput {
  method: string; // CASH, CARD, TRANSFER
  amount: number | string;
}

export interface CheckoutRequest {
  inventory_item_ids: string[];
  customer_id?: number | null;
  payments: PaymentInput[];
  idempotency_key: string;
}

export interface InvoiceItemOut {
  id: number;
  inventory_item_id: string;
  historical_weight: string | number;
  historical_karat: number;
  historical_gold_price_per_gram: string | number;
  historical_manufacturing_fee: string | number;
  line_total: string | number;
}

export interface InvoiceOut {
  id: number;
  invoice_number: string;
  pdf_url: string | null;
  created_at: string;
  items: InvoiceItemOut[];
}

export interface PaymentOut {
  id: number;
  amount: string | number;
  method: string;
  created_at: string;
}

export interface SaleOut {
  id: number;
  customer_id: number | null;
  user_id: number;
  idempotency_key: string;
  status: string;
  total_amount: string | number;
  created_at: string;
  payments: PaymentOut[];
  invoice: InvoiceOut | null;
}

export interface GoldPriceOut {
  id: number;
  karat: number;
  price_per_gram: string;
  effective_from: string;
  created_by_id: number;
}

export interface RefundRequest {
  reason: string;
}

export interface RefundOutBase {
  id: number;
  payment_id: number;
  amount: string | number;
  reason: string | null;
  created_at: string;
}

export interface RefundResponse {
  sale: SaleOut;
  refunds: RefundOutBase[];
}
