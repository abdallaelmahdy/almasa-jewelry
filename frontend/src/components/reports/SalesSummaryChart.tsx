"use client";

import { useSalesSummary } from "@/hooks/useReports";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function SalesSummaryChart({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const { data: summary, isLoading, isError } = useSalesSummary(dateFrom, dateTo);

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive shadow-sm h-[400px] flex items-center justify-center text-center">
        تعذر تحميل المخطط البياني
      </div>
    );
  }

  const chartData = [
    {
      name: "ملخص الفترة",
      "إجمالي المبيعات": Number(summary.gross_sales),
      "صافي المبيعات": Number(summary.net_sales),
      "تكلفة البضاعة المباعة": Number(summary.cogs),
      "إجمالي الربح": Number(summary.gross_profit),
    },
  ];

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm h-[400px] flex flex-col" dir="ltr">
      <h3 className="text-lg font-bold mb-6 text-right w-full" dir="rtl">مخطط الأداء المالي</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" tickFormatter={(value) => `${value}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e1e1e", borderColor: "#333", borderRadius: "8px" }}
              itemStyle={{ fontWeight: "bold" }}
              formatter={(value: any) => [`${Number(value || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.إ`, ""]}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="إجمالي المبيعات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="صافي المبيعات" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="تكلفة البضاعة المباعة" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="إجمالي الربح" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
