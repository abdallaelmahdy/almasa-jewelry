"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useAuditLogs } from "@/hooks/useAudit";
import { startOfDay, endOfDay } from "date-fns";
import { ReportDateRange } from "@/components/reports/ReportDateRange";
import { AuditTable } from "@/components/audit/AuditTable";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { ShieldAlert, Search } from "lucide-react";

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="bg-[#c5a059]/10 p-3 rounded-xl text-[#c5a059]">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">سجل التدقيق والمراقبة</h2>
          <p className="text-gray-400 mt-1">
            مراقبة وتتبع جميع الحركات والتعديلات داخل النظام.
          </p>
        </div>
      </div>

      <div className="p-4 bg-[#0a0a0a] border border-[#262626] rounded-xl shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">التاريخ</label>
            <ReportDateRange
              value={{ from: dateRange.from || new Date(), to: dateRange.to || new Date() }}
              onChange={(r) => setDateRange(r)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">رقم الموظف</label>
            <input
              type="number"
              placeholder="مثال: 2"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="w-32 bg-[#141414] border border-[#262626] rounded-xl px-4 py-2 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors"
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-400 font-medium">نوع الحركة</label>
            <input
              placeholder="مثال: SALE_COMPLETED"
              value={actionTypeInput}
              onChange={(e) => setActionTypeInput(e.target.value)}
              className="w-48 bg-[#141414] border border-[#262626] rounded-xl px-4 py-2 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors"
              dir="ltr"
            />
          </div>

          <div className="flex gap-2">
            <LuxuryButton onClick={handleApplyFilters} className="py-2">
              <Search className="w-4 h-4 me-2" />
              تصفية
            </LuxuryButton>
            <button 
              onClick={handleClearFilters} 
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="p-4 rounded-xl bg-[#3f1414] text-[#f87171] border border-[#f87171]/20 text-center font-medium">
          حدث خطأ أثناء جلب السجلات: {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="rounded-xl border border-[#262626] bg-[#0a0a0a] shadow-sm overflow-hidden">
          <AuditTable logs={logs || []} isLoading={isLoading} />
          
          <div className="flex items-center justify-between p-4 border-t border-[#262626] bg-[#141414]">
            <button
              className="px-4 py-2 text-sm text-white bg-[#262626] hover:bg-[#333] border border-[#333] rounded-md transition-colors disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              السابق
            </button>
            <span className="text-sm text-gray-400 font-mono">الصفحة {page}</span>
            <button
              className="px-4 py-2 text-sm text-white bg-[#262626] hover:bg-[#333] border border-[#333] rounded-md transition-colors disabled:opacity-50"
              onClick={() => setPage((p) => p + 1)}
              disabled={!logs || logs.length < limit || isLoading}
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
