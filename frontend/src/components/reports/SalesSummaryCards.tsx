"use client";

import { useSalesSummary } from "@/hooks/useReports";
import { Loader2, TrendingUp, TrendingDown, ArrowLeftRight, Coins, DollarSign } from "lucide-react";

export function SalesSummaryCards({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
  const { data: summary, isLoading, isError, error } = useSalesSummary(dateFrom, dateTo);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 rounded-xl border border-border bg-card animate-pulse h-[116px]"></div>
        ))}
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-center">
        تعذر تحميل ملخص المبيعات
      </div>
    );
  }

  const cards = [
    {
      title: "إجمالي المبيعات",
      value: summary.gross_sales,
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      color: "text-blue-500",
    },
    {
      title: "المستردات",
      value: summary.refunds,
      icon: <ArrowLeftRight className="w-5 h-5 text-red-500" />,
      color: "text-red-500",
    },
    {
      title: "صافي المبيعات",
      value: summary.net_sales,
      icon: <DollarSign className="w-5 h-5 text-green-500" />,
      color: "text-green-500",
    },
    {
      title: "تكلفة البضاعة المباعة",
      value: summary.cogs,
      icon: <Coins className="w-5 h-5 text-orange-500" />,
      color: "text-orange-500",
    },
    {
      title: "إجمالي الربح",
      value: summary.gross_profit,
      icon: <TrendingUp className="w-5 h-5 text-emerald-500" />,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">{c.title}</h4>
            <div className="p-2 bg-muted rounded-lg">{c.icon}</div>
          </div>
          <div className={`text-2xl font-bold font-mono ${c.color}`}>
            {Number(c.value).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-sans text-muted-foreground">د.إ</span>
          </div>
        </div>
      ))}
    </div>
  );
}
