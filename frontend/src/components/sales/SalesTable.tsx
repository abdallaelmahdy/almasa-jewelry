"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { SaleOut } from "@/types/sales";
import { Eye, Loader2, FileX } from "lucide-react";

export function SalesTable({
  sales,
  isLoading,
  onView,
}: {
  sales: SaleOut[];
  isLoading: boolean;
  onView: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#262626] rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#c5a059]" />
        <span className="text-gray-400 font-medium">جاري تحميل المبيعات...</span>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#262626] rounded-xl border-dashed">
        <FileX className="h-10 w-10 text-[#262626] mb-4" />
        <span className="text-gray-500 font-medium">لا توجد مبيعات مسجلة.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#0a0a0a] border border-[#262626] rounded-xl">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-[#141414] border-b border-[#262626] text-gray-400 text-sm">
            <th className="p-4 font-medium whitespace-nowrap">رقم الفاتورة</th>
            <th className="p-4 font-medium whitespace-nowrap">تاريخ العملية</th>
            <th className="p-4 font-medium whitespace-nowrap">العميل</th>
            <th className="p-4 font-medium whitespace-nowrap">المبلغ الإجمالي</th>
            <th className="p-4 font-medium whitespace-nowrap">الحالة</th>
            <th className="p-4 font-medium text-center whitespace-nowrap">التفاصيل</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#262626]">
          {sales.map((sale) => (
            <tr 
              key={sale.id} 
              className={`hover:bg-[#141414]/50 transition-colors ${sale.status === "REFUNDED" ? "bg-[#3f1414]/20" : ""}`}
            >
              <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                {sale.invoice?.invoice_number || `SALE-${sale.id}`}
              </td>
              <td className="p-4 text-gray-400 text-sm whitespace-nowrap font-mono">
                {format(new Date(sale.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}
              </td>
              <td className="p-4 whitespace-nowrap">
                {sale.customer_id ? (
                  <span className="text-gray-300">رقم {sale.customer_id}</span>
                ) : (
                  <span className="text-gray-500 bg-[#141414] px-2 py-1 rounded border border-[#262626] text-xs">عميل نقدي</span>
                )}
              </td>
              <td className="p-4 whitespace-nowrap">
                <span className="font-mono text-lg font-bold text-white">
                  {sale.total_amount} <span className="text-sm text-[#c5a059] font-sans">ج.م</span>
                </span>
              </td>
              <td className="p-4 whitespace-nowrap">
                {sale.status === "COMPLETED" ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#142617] text-[#4ade80] border border-[#4ade80]/20">مكتملة</span>
                ) : sale.status === "REFUNDED" ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3f1414] text-[#f87171] border border-[#f87171]/20">مسترجعة</span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3b2a0c] text-[#fbbf24] border border-[#fbbf24]/20">{sale.status}</span>
                )}
              </td>
              <td className="p-4 text-center whitespace-nowrap">
                <button
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-md hover:bg-[#c5a059]/20 transition-colors"
                  onClick={() => onView(sale.id)}
                >
                  <Eye className="w-3.5 h-3.5 me-1.5" />
                  عرض الفاتورة
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
