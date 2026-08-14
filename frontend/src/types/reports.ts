export interface SalesSummaryReport {
  gross_sales: string | number;
  refunds: string | number;
  net_sales: string | number;
  cogs: string | number;
  gross_profit: string | number;
}

export interface InventoryValuationReport {
  total_cost_basis: string | number;
  total_weight: string | number;
}
