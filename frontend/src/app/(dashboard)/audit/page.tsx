"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useAuditLogs } from "@/hooks/useAudit";
import { startOfDay, endOfDay } from "date-fns";
import { ReportDateRange } from "@/components/reports/ReportDateRange";
import { Search, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const AuditTable = dynamic(
  () => import("@/components/audit/AuditTable").then((mod) => mod.AuditTable),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 border border-border bg-transparent shadow-sm h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function AuditPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/pos");
    }
  }, [user, router]);

  const [page, setPage] = useState(1);
  const limit = 50;

  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  const [userIdInput, setUserIdInput] = useState("");
  const [actionTypeInput, setActionTypeInput] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<{
    user_id?: number;
    action_type?: string;
  }>({});

  const { data: logs, isLoading, isError, error } = useAuditLogs({
    skip: (page - 1) * limit,
    limit,
    user_id: appliedFilters.user_id,
    action_type: appliedFilters.action_type,
    date_from: dateRange.from ? startOfDay(dateRange.from).toISOString() : undefined,
    date_to: dateRange.to ? endOfDay(dateRange.to).toISOString() : undefined,
  });

  if (!user || user.role !== "admin") return null;

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters({
      user_id: userIdInput ? parseInt(userIdInput) : undefined,
      action_type: actionTypeInput || undefined,
    });
  };

  const handleClearFilters = () => {
    setPage(1);
    setUserIdInput("");
    setActionTypeInput("");
    setDateRange({ from: null, to: null });
    setAppliedFilters({});
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-white/5 gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl md:text-4xl text-white">سجل المراقبة</h2>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
            ALMASA AUDIT TRAIL
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 border border-white/10 bg-transparent">
        <div className="flex-1 flex flex-col sm:flex-row gap-0 border-b lg:border-b-0 lg:border-l border-white/10">
          <div className="flex-1 flex items-center px-4 py-3 border-b sm:border-b-0 sm:border-l border-white/10">
            <span className="font-sans text-[10px] uppercase tracking-luxury text-white/50 w-16">التاريخ:</span>
            <div className="flex-1">
              <ReportDateRange
                value={{ from: dateRange.from || new Date(), to: dateRange.to || new Date() }}
                onChange={(r) => setDateRange(r)}
              />
            </div>
          </div>

          <div className="flex-1 flex items-center px-4 py-3 border-b sm:border-b-0 sm:border-l border-white/10">
            <span className="font-sans text-[10px] uppercase tracking-luxury text-white/50 w-24">الموظف (ID):</span>
            <input
              type="number"
              placeholder="00"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-white font-numeric tracking-widest placeholder-white/20 focus:outline-none min-w-0"
              dir="ltr"
            />
          </div>

          <div className="flex-1 flex items-center px-4 py-3">
            <span className="font-sans text-[10px] uppercase tracking-luxury text-white/50 w-20">الحركة:</span>
            <input
              placeholder="ACTION_TYPE"
              value={actionTypeInput}
              onChange={(e) => setActionTypeInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-white font-sans text-xs tracking-wide placeholder-white/20 focus:outline-none min-w-0"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex">
          <button 
            onClick={handleApplyFilters} 
            className="flex-1 lg:flex-none px-6 py-3 bg-white/[0.05] hover:bg-primary hover:text-black transition-colors font-sans text-[10px] uppercase tracking-luxury font-bold border-l lg:border-l-0 border-white/10"
          >
            <Search className="w-3 h-3 inline me-2" />
            تصفية
          </button>
          <button 
            onClick={handleClearFilters} 
            className="px-6 py-3 text-white/40 hover:text-white transition-colors font-sans text-[10px] uppercase tracking-luxury"
          >
            إلغاء
          </button>
        </div>
      </div>

      {isError ? (
        <div className="p-4 bg-red-950/20 text-red-500 border-l-2 border-red-500 text-sm font-sans tracking-wide">
          <span className="font-bold">خطأ:</span> {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="border border-white/10 bg-transparent flex flex-col gap-0 overflow-hidden">
          <AuditTable logs={logs || []} isLoading={isLoading} />
          
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/[0.02]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-6 py-2 border border-white/10 text-white hover:bg-white/[0.05] disabled:opacity-50 transition-colors font-sans text-[10px] uppercase tracking-luxury rounded-none"
            >
              السابق
            </button>
            <span className="font-sans text-[10px] uppercase tracking-luxury text-white/50">الصفحة {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!logs || logs.length < limit || isLoading}
              className="px-6 py-2 border border-white/10 text-white hover:bg-white/[0.05] disabled:opacity-50 transition-colors font-sans text-[10px] uppercase tracking-luxury rounded-none"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
