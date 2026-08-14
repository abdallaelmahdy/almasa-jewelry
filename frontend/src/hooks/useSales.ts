import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SaleOut, RefundRequest, RefundResponse } from "@/types/sales";

interface SalesFilters {
  skip?: number;
  limit?: number;
}

export function useSales(filters: SalesFilters) {
  return useQuery({
    queryKey: ["sales", filters],
    queryFn: async () => {
      const { data } = await api.get<SaleOut[]>("/sales", {
        params: filters,
      });
      return data;
    },
  });
}

export function useSale(id: number | null) {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<SaleOut>(`/sales/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useRefundSale() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: RefundRequest }) => {
      const { data } = await api.post<RefundResponse>(`/sales/${id}/refund`, payload);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
