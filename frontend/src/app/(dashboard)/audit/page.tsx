"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useAuditLogs } from "@/hooks/useAudit";
import { startOfDay, endOfDay } from "date-fns";
import { ReportDateRange } from "@/components/reports/ReportDateRange";
import { AuditTable } from "@/components/audit/AuditTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">سجل التدقيق والمراقبة</h2>
          <p className="text-muted-foreground mt-1">
            مراقبة وتتبع جميع الحركات والتعديلات داخل النظام.
          </p>
        </div>
      </div>

      <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">التاريخ</label>
            <ReportDateRange
              value={{ from: dateRange.from || new Date(), to: dateRange.to || new Date() }}
              onChange={(r) => setDateRange(r)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">رقم الموظف</label>
            <Input
              type="number"
              placeholder="مثال: 2"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="w-32"
              dir="ltr"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">نوع الحركة</label>
            <Input
              placeholder="مثال: SALE_COMPLETED"
              value={actionTypeInput}
              onChange={(e) => setActionTypeInput(e.target.value)}
              className="w-48"
              dir="ltr"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} variant="secondary">
              <Search className="w-4 h-4 me-2" />
              تصفية
            </Button>
            <Button onClick={handleClearFilters} variant="ghost">
              إلغاء
            </Button>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-center">
          حدث خطأ أثناء جلب السجلات: {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <AuditTable logs={logs || []} isLoading={isLoading} />
          
          <div className="flex items-center justify-between p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              السابق
            </Button>
            <span className="text-sm text-muted-foreground">الصفحة {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!logs || logs.length < limit || isLoading}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
