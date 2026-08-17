"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { startOfMonth, endOfDay, subMonths } from "date-fns";
import { useAuthStore } from "@/stores/authStore";
import { useSalesSummary, useInventoryValuation } from "@/hooks/useReports";
import { useInventory } from "@/hooks/useInventory";
import { useSales } from "@/hooks/useSales";
import { useCustomers } from "@/hooks/useCustomers";
import { useGoldPrice } from "@/hooks/usePOS";
import {
  formatMoney,
  formatDateAr,
  formatMonthAr,
  formatPercentChange,
  saleStatusLabel,
} from "@/lib/format";

function KpiSkeleton() {
  return <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />;
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const [period] = useState(() => {
    const now = new Date();
    return {
      now,
      currentFrom: startOfMonth(now).toISOString(),
      currentTo: endOfDay(now).toISOString(),
      previousFrom: startOfMonth(subMonths(now, 1)).toISOString(),
      previousTo: startOfMonth(now).toISOString(),
    };
  });

  const { data: currentSummary, isLoading: loadingSummary } = useSalesSummary(
    period.currentFrom,
    period.currentTo,
    isAdmin
  );
  const { data: previousSummary } = useSalesSummary(
    period.previousFrom,
    period.previousTo,
    isAdmin
  );

  const { data: valuation } = useInventoryValuation(isAdmin);
  const { data: availableItems, isLoading: loadingInventory } = useInventory({
    status: "AVAILABLE",
    limit: 500,
  });
  const { data: gold21, isLoading: loadingGold } = useGoldPrice(21);
  const { data: sales, isLoading: loadingSales } = useSales({ skip: 0, limit: 100 });
  const { data: customers } = useCustomers({ limit: 200 });

  const customerNames = useMemo(() => {
    const map = new Map<number, string>();
    customers?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  const latestSales = useMemo(() => (sales ?? []).slice(0, 6), [sales]);

  const chartData = useMemo(() => {
    const from = new Date(period.currentFrom).getTime();
    const buckets = new Map<string, number>();
    for (const sale of sales ?? []) {
      const t = new Date(sale.created_at).getTime();
      if (t < from) continue;
      const key = sale.created_at.slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + Number(sale.total_amount));
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, salesTotal]) => ({
        day: formatDateAr(day),
        sales: salesTotal,
      }));
  }, [sales, period.currentFrom]);

  const availableCount = availableItems?.length ?? 0;
  const availableCapped = (availableItems?.length ?? 0) >= 500;

  const gross = currentSummary ? Number(currentSummary.gross_sales) : null;
  const prevGross = previousSummary ? Number(previousSummary.gross_sales) : null;
  const profit = currentSummary ? Number(currentSummary.gross_profit) : null;
  const prevProfit = previousSummary ? Number(previousSummary.gross_profit) : null;

  const salesChange =
    gross !== null && prevGross !== null ? formatPercentChange(gross, prevGross) : null;
  const profitChange =
    profit !== null && prevProfit !== null ? formatPercentChange(profit, prevProfit) : null;

  const employeeMonth = useMemo(() => {
    const from = new Date(period.currentFrom).getTime();
    const monthSales = (sales ?? []).filter((s) => new Date(s.created_at).getTime() >= from);
    return {
      total: monthSales.reduce((sum, s) => sum + Number(s.total_amount), 0),
      count: monthSales.length,
    };
  }, [sales, period.currentFrom]);

  return (
    <div className="bg-[#0A0A0A] w-full h-full text-white font-sans overflow-y-auto p-6 md:p-8" dir="rtl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#D4AF37] rounded-xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <span className="text-xs text-black/70 mb-1 font-bold">
              {isAdmin ? "إجمالي المبيعات" : "مبيعات الشهر"}
            </span>
            <div className="text-3xl font-bold text-black mb-1 flex items-baseline gap-1">
              {isAdmin ? (
                loadingSummary ? (
                  <KpiSkeleton />
                ) : (
                  <>
                    <span>{formatMoney(currentSummary?.gross_sales)}</span>
                    <span className="text-sm">ج.م</span>
                  </>
                )
              ) : loadingSales ? (
                <KpiSkeleton />
              ) : (
                <>
                  <span>{formatMoney(employeeMonth.total)}</span>
                  <span className="text-sm">ج.م</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-black/70">
              {isAdmin && salesChange
                ? `${salesChange} من الشهر الماضي`
                : formatMonthAr(period.now)}
            </span>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-white/70 mb-1">القطع المتاحة</span>
            <div className="text-3xl font-bold text-white mb-1 flex items-baseline gap-1">
              {loadingInventory ? (
                <KpiSkeleton />
              ) : (
                <>
                  <span>
                    {new Intl.NumberFormat("ar-EG").format(availableCount)}
                    {availableCapped ? "+" : ""}
                  </span>
                  <span className="text-sm text-white/50">قطعة</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-white/40">
              {isAdmin && valuation
                ? `تكلفة المخزون ${formatMoney(valuation.total_cost_basis)} ج.م`
                : "مخزون جاهز للبيع"}
            </span>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-white/70 mb-1">
              {isAdmin ? "إجمالي الأرباح" : "عدد الفواتير"}
            </span>
            <div className="text-3xl font-bold text-white mb-1 flex items-baseline gap-1">
              {isAdmin ? (
                loadingSummary ? (
                  <KpiSkeleton />
                ) : (
                  <>
                    <span>{formatMoney(currentSummary?.gross_profit)}</span>
                    <span className="text-sm text-white/50">ج.م</span>
                  </>
                )
              ) : loadingSales ? (
                <KpiSkeleton />
              ) : (
                <>
                  <span>{new Intl.NumberFormat("ar-EG").format(employeeMonth.count)}</span>
                  <span className="text-sm text-white/50">عملية</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-white/40">
              {isAdmin && profitChange
                ? `${profitChange} من الشهر الماضي`
                : isAdmin
                  ? formatMonthAr(period.now)
                  : "آخر العمليات"}
            </span>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-white/70 mb-1">سعر الذهب اليوم</span>
            <div className="text-3xl font-bold text-white mb-1 flex items-baseline gap-1">
              {loadingGold ? (
                <KpiSkeleton />
              ) : (
                <>
                  <span>{formatMoney(gold21?.price_per_gram)}</span>
                  <span className="text-sm text-white/50">ج.م</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-white/40">عيار 21</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#111111] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm text-white/80 mb-4 font-bold">آخر عمليات البيع</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/50">
                    <th className="py-2 font-normal">الحالة</th>
                    <th className="py-2 font-normal">التاريخ</th>
                    <th className="py-2 font-normal">المبلغ</th>
                    <th className="py-2 font-normal">العميل</th>
                    <th className="py-2 font-normal">الفاتورة</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingSales ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/40">
                        جاري التحميل...
                      </td>
                    </tr>
                  ) : latestSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/40">
                        لا توجد مبيعات بعد
                      </td>
                    </tr>
                  ) : (
                    latestSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 text-[#D4AF37]">{saleStatusLabel(sale.status)}</td>
                        <td className="py-3 text-white/70">{formatDateAr(sale.created_at)}</td>
                        <td className="py-3 text-white">
                          {formatMoney(sale.total_amount)} ج.م
                        </td>
                        <td className="py-3 text-white/70">
                          {sale.customer_id
                            ? customerNames.get(sale.customer_id) ?? `رقم ${sale.customer_id}`
                            : "عميل نقدي"}
                        </td>
                        <td className="py-3 text-white">
                          {sale.invoice?.invoice_number || `#${sale.id}`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl p-5 border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm text-white/80 font-bold">المبيعات خلال الشهر</h3>
              <div className="bg-[#1A1A1A] border border-white/10 rounded px-2 py-1 text-xs text-white/80">
                {formatMonthAr(period.now)}
              </div>
            </div>
            <div className="h-[200px] w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/40 text-xs">
                  لا توجد بيانات لهذا الشهر
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                      dataKey="day"
                      stroke="#ffffff40"
                      tick={{ fill: "#ffffff60", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#ffffff40"
                      tick={{ fill: "#ffffff60", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) =>
                        val === 0 ? "0" : `${new Intl.NumberFormat("ar-EG").format(val / 1000)} ألف`
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#D4AF37", strokeWidth: 2, stroke: "#111111" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
