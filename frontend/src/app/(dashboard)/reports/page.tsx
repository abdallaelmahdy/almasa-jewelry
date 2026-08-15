"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ReportDateRange } from "@/components/reports/ReportDateRange";
import { SalesSummaryCards } from "@/components/reports/SalesSummaryCards";
import { SalesSummaryChart } from "@/components/reports/SalesSummaryChart";
import { InventoryValuationCard } from "@/components/reports/InventoryValuationCard";

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
    <div className="space-y-8 max-w-[1600px] mx-auto px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-white/5 gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl md:text-4xl text-white">التقارير</h2>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
            ALMASA EXECUTIVE SUMMARY
          </p>
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
