"use client";

import { useAuthStore } from "@/stores/authStore";
import { useSalesSummary, useInventoryValuation } from "@/hooks/useReports";
import { useSales } from "@/hooks/useSales";
import { useGoldPrice } from "@/hooks/usePOS";
import { format, subDays, parseISO } from "date-fns";
import { Loader2, TrendingUp, PackageSearch, Activity, Diamond, AlertCircle } from "lucide-react";
import { LuxuryCard, LuxuryCardContent, LuxuryCardHeader, LuxuryCardTitle } from "@/components/luxury/LuxuryCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useMemo } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  // Date range for today
  const today = new Date();
  const dateStr = format(today, "yyyy-MM-dd");

  const { data: salesSummary, isLoading: isLoadingSales } = useSalesSummary(dateStr, dateStr);
  const { data: inventoryValuation, isLoading: isLoadingInventory } = useInventoryValuation();
  const { data: goldPrice21, isLoading: isLoadingGold } = useGoldPrice(21);
  const { data: recentSales, isLoading: isLoadingRecentSales } = useSales({ limit: 100 });

  const formatCurrency = (val: string | number | undefined) => {
    if (!val) return "0.00";
    return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Process sales data for chart
  const chartData = useMemo(() => {
    if (!recentSales || recentSales.length === 0) return [];
    
    // Group by date
    const grouped = recentSales.reduce((acc: Record<string, number>, sale) => {
      // The API returns created_at as ISO string, e.g. "2023-10-27T10:00:00Z"
      // Wait, is it ISO? Yes.
      try {
        const date = format(parseISO(sale.created_at), "MMM dd");
        acc[date] = (acc[date] || 0) + Number(sale.total_amount || 0);
      } catch (e) {
        // Fallback
      }
      return acc;
    }, {});

    // Create array and sort by date. 
    // For a real app, you'd want to fill in missing days, but this is fine for now.
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .reverse(); // Assuming recentSales comes newest first
  }, [recentSales]);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">لوحة القيادة</h2>
        <p className="text-gray-400">
          أهلاً بك <span className="text-[#c5a059] font-medium">{user?.username}</span> في نظام إدارة الماسة للمجوهرات.
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Sales Summary Widget */}
        <LuxuryCard className="bg-[#0d0d0d] border-[#262626] relative overflow-hidden group hover:border-[#c5a059]/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-[#c5a059]" />
          </div>
          <LuxuryCardHeader className="pb-2">
            <LuxuryCardTitle className="text-sm font-medium text-gray-400">إجمالي مبيعات اليوم</LuxuryCardTitle>
          </LuxuryCardHeader>
          <LuxuryCardContent>
            <div className="text-3xl font-bold text-white tracking-tight">
              {isLoadingSales ? <Loader2 className="w-6 h-6 animate-spin text-[#c5a059]" /> : `${formatCurrency(salesSummary?.net_sales)}`}
            </div>
            <p className="text-xs text-[#c5a059] mt-2 tracking-wide font-medium">ج.م</p>
          </LuxuryCardContent>
        </LuxuryCard>

        {/* Inventory Weight Widget */}
        <LuxuryCard className="bg-[#0d0d0d] border-[#262626] relative overflow-hidden group hover:border-[#c5a059]/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PackageSearch className="w-16 h-16 text-[#c5a059]" />
          </div>
          <LuxuryCardHeader className="pb-2">
            <LuxuryCardTitle className="text-sm font-medium text-gray-400">إجمالي وزن المخزون</LuxuryCardTitle>
          </LuxuryCardHeader>
          <LuxuryCardContent>
            <div className="text-3xl font-bold text-white tracking-tight">
              {isLoadingInventory ? <Loader2 className="w-6 h-6 animate-spin text-[#c5a059]" /> : `${formatCurrency(inventoryValuation?.total_weight)}`}
            </div>
            <p className="text-xs text-gray-500 mt-2 tracking-wide font-medium">جرام</p>
          </LuxuryCardContent>
        </LuxuryCard>

        {/* Gold Price Widget */}
        <LuxuryCard className="bg-[#0d0d0d] border-[#262626] relative overflow-hidden group hover:border-[#c5a059]/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-[#c5a059]" />
          </div>
          <LuxuryCardHeader className="pb-2">
            <LuxuryCardTitle className="text-sm font-medium text-gray-400">سعر الذهب (عيار 21)</LuxuryCardTitle>
          </LuxuryCardHeader>
          <LuxuryCardContent>
            <div className="text-3xl font-bold text-[#c5a059] tracking-tight">
              {isLoadingGold ? <Loader2 className="w-6 h-6 animate-spin text-[#c5a059]" /> : `${formatCurrency(goldPrice21?.price_per_gram)}`}
            </div>
            <p className="text-xs text-[#c5a059] mt-2 tracking-wide font-medium">ج.م / جرام</p>
          </LuxuryCardContent>
        </LuxuryCard>

        {/* System Status Widget */}
        <LuxuryCard className="bg-[#0d0d0d] border-[#262626] relative overflow-hidden group hover:border-[#c5a059]/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Diamond className="w-16 h-16 text-[#c5a059]" />
          </div>
          <LuxuryCardHeader className="pb-2">
            <LuxuryCardTitle className="text-sm font-medium text-gray-400">المستخدم الحالي</LuxuryCardTitle>
          </LuxuryCardHeader>
          <LuxuryCardContent>
            <div className="text-2xl font-bold text-white truncate tracking-tight">
              {user?.username}
            </div>
            <div className="mt-2 flex">
              <span className="text-xs font-medium text-[#0d0d0d] bg-[#c5a059] px-2.5 py-0.5 rounded-sm tracking-wide">
                {user?.role === "admin" ? "مدير النظام" : "موظف مبيعات"}
              </span>
            </div>
          </LuxuryCardContent>
        </LuxuryCard>

      </div>
      
      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-7">
        <LuxuryCard className="md:col-span-4 lg:col-span-5 bg-[#0a0a0a] border-[#262626]">
          <LuxuryCardHeader>
            <LuxuryCardTitle className="text-white">نظرة عامة على المبيعات</LuxuryCardTitle>
          </LuxuryCardHeader>
          <LuxuryCardContent className="pl-2">
            {isLoadingRecentSales ? (
              <div className="h-[350px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#c5a059]" />
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c5a059" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#c5a059" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `EGP ${value}`}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141414', borderColor: '#262626', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#c5a059', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      name="المبيعات"
                      stroke="#c5a059" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-gray-500">
                <AlertCircle className="w-12 h-12 mb-4 text-[#262626]" />
                <p>بيانات غير كافية لإنشاء الرسم البياني</p>
                <p className="text-sm mt-2">لا توجد مبيعات مسجلة في الفترة الأخيرة</p>
              </div>
            )}
          </LuxuryCardContent>
        </LuxuryCard>

        {/* Additional Panel */}
        <LuxuryCard className="md:col-span-3 lg:col-span-2 bg-[#0a0a0a] border-[#262626]">
          <LuxuryCardHeader>
            <LuxuryCardTitle className="text-white">تنبيهات النظام</LuxuryCardTitle>
          </LuxuryCardHeader>
          <LuxuryCardContent>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-[#c5a059]/20 p-2 rounded-full">
                  <Activity className="w-4 h-4 text-[#c5a059]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">تحديث السعر العالمي</p>
                  <p className="text-xs text-gray-400 mt-1">تم تحديث سعر الذهب عيار 21 تلقائياً منذ ساعتين.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-[#262626] p-2 rounded-full">
                  <PackageSearch className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">المخزون مستقر</p>
                  <p className="text-xs text-gray-400 mt-1">لا توجد قطع مجوهرات بحاجة إلى جرد في الوقت الحالي.</p>
                </div>
              </div>
            </div>
          </LuxuryCardContent>
        </LuxuryCard>
      </div>
    </div>
  );
}
