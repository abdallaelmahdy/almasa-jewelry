"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const mockChartData = [
    { day: "1", sales: 1000 },
    { day: "7", sales: 4500 },
    { day: "14", sales: 3800 },
    { day: "21", sales: 6000 },
    { day: "28", sales: 8500 },
  ];

  const latestSales = [
    { id: "#1001", customer: "أحمد محمد", amount: "5,450 ج.م", date: "2024-05-15", status: "تم البيع" },
    { id: "#1002", customer: "سارة علي", amount: "3,200 ج.م", date: "2024-05-15", status: "تم البيع" },
    { id: "#1003", customer: "محمد حسن", amount: "7,800 ج.م", date: "2024-05-14", status: "تم البيع" },
    { id: "#1004", customer: "فاطمة محمود", amount: "2,950 ج.م", date: "2024-05-14", status: "تم البيع" },
  ];

  return (
    <div className="bg-[#0A0A0A] w-full h-full text-white font-sans overflow-y-auto p-6 md:p-8" dir="rtl">
      <div className="space-y-4">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Total Sales (Solid Gold Card) */}
          <div className="bg-[#D4AF37] rounded-xl p-4 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <span className="text-xs text-black/70 mb-1 font-bold">إجمالي المبيعات</span>
            <div className="text-3xl font-bold text-black mb-1 flex items-baseline gap-1">
              <span>125,000</span>
              <span className="text-sm">ج.م</span>
            </div>
            <span className="text-[10px] text-black/70">+12.5% من الشهر الماضي</span>
          </div>

          {/* Products Count */}
          <div className="bg-[#111111] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-white/70 mb-1">عدد المنتجات</span>
            <div className="text-3xl font-bold text-white mb-1 flex items-baseline gap-1">
              <span>320</span>
              <span className="text-sm text-white/50">منتج</span>
            </div>
            <span className="text-[10px] text-white/40">+ من الشهر الماضي</span>
          </div>

          {/* Total Profit */}
          <div className="bg-[#111111] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-white/70 mb-1">إجمالي الأرباح</span>
            <div className="text-3xl font-bold text-white mb-1 flex items-baseline gap-1">
              <span>45,600</span>
              <span className="text-sm text-white/50">ج.م</span>
            </div>
            <span className="text-[10px] text-white/40">+10.3% من الشهر الماضي</span>
          </div>

          {/* Gold Price Today */}
          <div className="bg-[#111111] rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-xs text-white/70 mb-1">سعر الذهب اليوم</span>
            <div className="text-3xl font-bold text-white mb-1 flex items-baseline gap-1">
              <span>2,305</span>
              <span className="text-sm text-white/50">ج.م</span>
            </div>
            <span className="text-[10px] text-white/40">عيار 21</span>
          </div>
        </div>
        
        {/* Charts & Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Latest Sales Table */}
          <div className="bg-[#111111] rounded-xl p-5 border border-white/5">
            <h3 className="text-sm text-white/80 mb-4 font-bold">آخر عمليات البيع</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
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
                  {latestSales.map((sale, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 text-[#D4AF37]">{sale.status}</td>
                      <td className="py-3 text-white/70">{sale.date}</td>
                      <td className="py-3 text-white">{sale.amount}</td>
                      <td className="py-3 text-white/70">{sale.customer}</td>
                      <td className="py-3 text-white">{sale.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Sales Chart */}
          <div className="bg-[#111111] rounded-xl p-5 border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm text-white/80 font-bold">المبيعات خلال الشهر</h3>
              <div className="bg-[#1A1A1A] border border-white/10 rounded px-2 py-1 text-xs text-white/80 flex items-center gap-2">
                <span>مايو 2024</span>
                <span className="text-[10px]">▼</span>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="day" stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false} ticks={["1", "7", "14", "21", "28"]} />
                  <YAxis stroke="#ffffff40" tick={{ fill: '#ffffff60', fontSize: 10 }} axisLine={false} tickLine={false} ticks={[0, 2000, 4000, 6000, 8000]} tickFormatter={(val) => val === 0 ? "0" : `${val/1000}K`} />
                  <Line type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={2} dot={{ r: 3, fill: '#D4AF37', strokeWidth: 2, stroke: '#111111' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
