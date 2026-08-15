"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ReportDateRange } from "@/components/reports/ReportDateRange";
import { SalesSummaryCards } from "@/components/reports/SalesSummaryCards";
import { SalesSummaryChart } from "@/components/reports/SalesSummaryChart";
import { InventoryValuationCard } from "@/components/reports/InventoryValuationCard";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Protect route
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/pos");
    }
  }, [user, router]);

  // Default to last 30 days
  const [dateRange, setDateRange] = useState({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date()),
  });

  if (!user || user.role !== "admin") return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#c5a059]/10 p-3 rounded-xl text-[#c5a059]">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">التقارير والإحصائيات</h2>
            <p className="text-gray-400 mt-1">
              متابعة أداء المبيعات والأرباح وقيمة المخزون الحالي.
            </p>
          </div>
        </div>

        <ReportDateRange 
          value={dateRange} 
          onChange={(newRange) => {
            if (newRange.from && newRange.to) {
              setDateRange({
                from: startOfDay(newRange.from),
                to: endOfDay(newRange.to),
              });
            }
          }} 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SalesSummaryCards
          dateFrom={dateRange.from.toISOString()}
          dateTo={dateRange.to.toISOString()}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesSummaryChart
              dateFrom={dateRange.from.toISOString()}
              dateTo={dateRange.to.toISOString()}
            />
          </div>
          <div className="lg:col-span-1">
            <InventoryValuationCard />
          </div>
        </div>
      </div>
    </div>
  );
}
