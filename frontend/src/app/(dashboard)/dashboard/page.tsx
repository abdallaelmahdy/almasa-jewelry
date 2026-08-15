"use client";

import { useAuthStore } from "@/stores/authStore";
import { useSalesSummary, useInventoryValuation } from "@/hooks/useReports";
import { useSales } from "@/hooks/useSales";
import { useGoldPrice } from "@/hooks/usePOS";
import { format, parseISO } from "date-fns";
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
      try {
        const date = format(parseISO(sale.created_at), "MMM dd");
        acc[date] = (acc[date] || 0) + Number(sale.total_amount || 0);
      } catch (e) {
        // Fallback
      }
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .reverse(); 
  }, [recentSales]);

  return (
    <div className="space-y-16 max-w-[1600px] mx-auto px-6 lg:px-12 py-12">
      {/* Header Section */}
      <div className="flex flex-col gap-3 pb-8 border-b border-white/10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-white font-light tracking-wide">المركز الرئيسي</h2>
            <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mt-4">
              إدارة العمليات <span className="text-primary/50 mx-2">|</span> {format(today, "MMMM dd, yyyy")}
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="font-sans text-[10px] text-white/40 uppercase tracking-luxury-wide mb-1">المستخدم الحالي</span>
            <span className="font-sans text-sm text-white tracking-wide">{user?.username}</span>
            <span className="font-sans text-[9px] text-primary uppercase tracking-luxury mt-1">
              {user?.role === "admin" ? "مدير النظام" : "موظف مبيعات"}
            </span>
          </div>
        </div>
      </div>
      
      {/* KPI Section - Stark Typography */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        
        {/* Sales Summary Widget */}
        <div className="flex flex-col border-t border-white/10 pt-6">
          <span className="font-sans text-[10px] text-white/50 uppercase tracking-luxury-wide mb-4 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-primary/70" />
            مبيعات اليوم
          </span>
          <div className="font-numeric text-4xl md:text-5xl text-white tracking-wider font-light flex items-baseline gap-2">
            {isLoadingSales ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : `${formatCurrency(salesSummary?.net_sales)}`}
          </div>
          <span className="font-sans text-[10px] text-primary/70 tracking-luxury uppercase mt-2">EGP</span>
        </div>

        {/* Inventory Weight Widget */}
        <div className="flex flex-col border-t border-white/10 pt-6">
          <span className="font-sans text-[10px] text-white/50 uppercase tracking-luxury-wide mb-4 flex items-center gap-2">
            <PackageSearch className="w-3 h-3 text-primary/70" />
            حجم المخزون
          </span>
          <div className="font-numeric text-4xl md:text-5xl text-white tracking-wider font-light flex items-baseline gap-2">
            {isLoadingInventory ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : `${formatCurrency(inventoryValuation?.total_weight)}`}
          </div>
          <span className="font-sans text-[10px] text-white/40 tracking-luxury uppercase mt-2">Gram</span>
        </div>

        {/* Gold Price Widget */}
        <div className="flex flex-col border-t border-white/10 pt-6">
          <span className="font-sans text-[10px] text-white/50 uppercase tracking-luxury-wide mb-4 flex items-center gap-2">
            <Activity className="w-3 h-3 text-primary/70" />
            سوق الذهب - عيار 21
          </span>
          <div className="font-numeric text-4xl md:text-5xl text-primary tracking-wider font-light flex items-baseline gap-2">
            {isLoadingGold ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : `${formatCurrency(goldPrice21?.price_per_gram)}`}
          </div>
          <span className="font-sans text-[10px] text-white/40 tracking-luxury uppercase mt-2">EGP / G</span>
        </div>

        {/* System Status Widget */}
        <div className="flex flex-col border-t border-white/10 pt-6">
          <span className="font-sans text-[10px] text-white/50 uppercase tracking-luxury-wide mb-4 flex items-center gap-2">
            <Diamond className="w-3 h-3 text-primary/70" />
            حالة النظام
          </span>
          <div className="font-sans text-2xl text-white tracking-wide font-light flex items-baseline gap-2 mt-2">
            متصل
          </div>
          <span className="font-sans text-[10px] text-green-400/70 tracking-luxury uppercase mt-2">All Systems Nominal</span>
        </div>

      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
        <div className="lg:col-span-8 flex flex-col border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-8">
            <span className="font-sans text-[10px] text-white/50 uppercase tracking-luxury-wide">نظرة عامة على المبيعات</span>
          </div>
          <div className="w-full">
            {isLoadingRecentSales ? (
              <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d0b47a" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#d0b47a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }} 
                      padding={{ left: 10, right: 10 }}
                      fontFamily="Inter, sans-serif"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, textAnchor: 'middle' }}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                      tickFormatter={(value) => `${value}`}
                      width={60}
                      fontFamily="Playfair Display, serif"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0px', padding: '16px' }}
                      itemStyle={{ color: '#d0b47a', fontWeight: 'bold', fontFamily: 'Playfair Display' }}
                      labelStyle={{ fontFamily: 'Inter', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      name="المبيعات"
                      stroke="#d0b47a" 
                      strokeWidth={1}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-white/20 border border-white/5 border-dashed">
                <AlertCircle className="w-8 h-8 mb-4 opacity-30" />
                <p className="font-sans text-[10px] uppercase tracking-luxury-wide">لا توجد بيانات متاحة</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-4 flex flex-col border-t border-white/10 pt-6">
          <span className="font-sans text-[10px] text-white/50 uppercase tracking-luxury-wide mb-8">التنبيهات التشغيلية</span>
          
          <div className="space-y-6">
            <div className="group flex flex-col p-6 bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 border border-primary/20">
                  <Activity className="w-3 h-3 text-primary" />
                </div>
                <span className="font-sans text-[10px] uppercase tracking-luxury text-primary">تحديث المؤشر</span>
              </div>
              <p className="font-sans text-xs text-white/80 leading-relaxed font-light">تحديث لحظي لأسعار السوق العالمية والمحلية قيد التشغيل.</p>
            </div>

            <div className="group flex flex-col p-6 bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-default">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 border border-white/10">
                  <PackageSearch className="w-3 h-3 text-white/60" />
                </div>
                <span className="font-sans text-[10px] uppercase tracking-luxury text-white/60">سلامة المخزون</span>
              </div>
              <p className="font-sans text-xs text-white/80 leading-relaxed font-light">عمليات الجرد مطابقة للمبيعات. لا توجد فروقات مسجلة.</p>
            </div>
            
            {user?.role === "admin" && (
              <div className="group flex flex-col p-6 bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors cursor-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 border border-white/10">
                    <TrendingUp className="w-3 h-3 text-white/60" />
                  </div>
                  <span className="font-sans text-[10px] uppercase tracking-luxury text-white/60">حركة المبيعات</span>
                </div>
                <p className="font-sans text-xs text-white/80 leading-relaxed font-light">
                  {recentSales?.length ? `تم تسجيل ${recentSales.length} عملية بيع في السجلات الحديثة.` : "لا توجد حركات بيع حديثة."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
