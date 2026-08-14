import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SalesSummaryReport, InventoryValuationReport } from "@/types/reports";

export function useSalesSummary(dateFrom: string, dateTo: string) {
  return useQuery({
    queryKey: ["reports", "sales-summary", dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await api.get<SalesSummaryReport>("/reports/sales-summary", {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
        },
      });
      return data;
    },
    // Don't refetch too aggressively for reports
    staleTime: 1000 * 60 * 5,
  });
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: ["reports", "inventory-valuation"],
    queryFn: async () => {
      const { data } = await api.get<InventoryValuationReport>("/reports/inventory-valuation");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
