import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CustomerOut, CustomerCreate, CustomerUpdate } from "@/types/customer";

interface CustomerFilters {
  skip?: number;
  limit?: number;
  q?: string;
}

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: async () => {
      // The backend GET /api/v1/customers returns List[CustomerOut]
      const { data } = await api.get<CustomerOut[]>("/customers", {
        params: filters,
      });
      return data;
    },
  });
}

export function useCustomer(id: number | null) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<CustomerOut>(`/customers/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CustomerCreate) => {
      // Clean up empty strings to null for backend uniqueness constraints
      const cleanedPayload = {
        ...payload,
        phone: payload.phone?.trim() || null,
        email: payload.email?.trim() || null,
        notes: payload.notes?.trim() || null,
      };
      
      const { data } = await api.post<CustomerOut>("/customers", cleanedPayload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: CustomerUpdate }) => {
      const cleanedPayload = {
        ...payload,
        phone: payload.phone?.trim() || null,
        email: payload.email?.trim() || null,
        notes: payload.notes?.trim() || null,
      };

      const { data } = await api.put<CustomerOut>(`/customers/${id}`, cleanedPayload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    },
  });
}
