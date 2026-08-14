import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  InventoryItemOut,
  InventoryItemCreate,
  InventoryTransitionRequest,
} from "@/types/inventory";

interface InventoryFilters {
  skip?: number;
  limit?: number;
  status?: string;
  product_id?: number;
  sku?: string;
}

export function useInventory(filters: InventoryFilters) {
  return useQuery({
    queryKey: ["inventory", filters],
    queryFn: async () => {
      const { data } = await api.get<InventoryItemOut[]>("/inventory", {
        params: filters,
      });
      return data;
    },
  });
}

export function useCreateInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: InventoryItemCreate) => {
      const { data } = await api.post<InventoryItemOut>("/inventory", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useLockInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: InventoryTransitionRequest;
    }) => {
      const { data } = await api.post<InventoryItemOut>(
        `/inventory/${id}/lock`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUnlockInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: InventoryTransitionRequest;
    }) => {
      const { data } = await api.post<InventoryItemOut>(
        `/inventory/${id}/unlock`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
