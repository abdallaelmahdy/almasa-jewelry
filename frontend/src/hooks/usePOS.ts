import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CheckoutRequest, SaleOut, GoldPriceOut } from "@/types/sales";

export function useGoldPrice(karat: number) {
  return useQuery({
    queryKey: ["goldPrice", karat],
    queryFn: async () => {
      const { data } = await api.get<GoldPriceOut>("/gold-prices/current", {
        params: { karat },
      });
      return data;
    },
    // Don't refetch too aggressively to avoid flickering during checkout, but keep it reasonably fresh
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CheckoutRequest) => {
      const { data } = await api.post<SaleOut>("/sales/checkout", payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries after a successful sale
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}
