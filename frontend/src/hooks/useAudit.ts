import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AuditLogOut } from "@/types/audit";

interface AuditFilters {
  skip?: number;
  limit?: number;
  user_id?: number;
  action_type?: string;
  date_from?: string;
  date_to?: string;
}

export function useAuditLogs(filters: AuditFilters) {
  return useQuery({
    queryKey: ["audit", filters],
    queryFn: async () => {
      const { data } = await api.get<AuditLogOut[]>("/audit", {
        params: filters,
      });
      return data;
    },
    // Keep logs fresh but avoid spamming
    staleTime: 1000 * 30,
  });
}
