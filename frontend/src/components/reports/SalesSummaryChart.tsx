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
      <div className="p-6 rounded-none border border-[#262626] bg-[#0a0a0a] shadow-sm h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c5a059]" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-6 rounded-none border border-[#f87171]/20 bg-[#3f1414] text-[#f87171] shadow-sm h-[400px] flex items-center justify-center text-center font-medium">
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
    <div className="p-6 rounded-none border border-[#262626] bg-[#0a0a0a] shadow-sm h-[400px] flex flex-col" dir="ltr">
      <h3 className="text-lg font-bold mb-6 text-right w-full text-white" dir="rtl">مخطط الأداء المالي</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis dataKey="name" stroke="#888" tick={{ fill: "#888" }} />
            <YAxis stroke="#888" tickFormatter={(value) => `${value}`} tick={{ fill: "#888" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#141414", borderColor: "#262626", borderRadius: "12px", color: "#fff" }}
              itemStyle={{ fontWeight: "bold" }}
              formatter={(value: any) => [`${Number(value || 0).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`, ""]}
            />
            <Legend wrapperStyle={{ paddingTop: "20px", color: "#ccc" }} />
            <Bar dataKey="إجمالي المبيعات" fill="#262626" radius={[4, 4, 0, 0]} />
            <Bar dataKey="تكلفة البضاعة المباعة" fill="#3f1414" radius={[4, 4, 0, 0]} />
            <Bar dataKey="صافي المبيعات" fill="#c5a059" radius={[4, 4, 0, 0]} />
            <Bar dataKey="إجمالي الربح" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
