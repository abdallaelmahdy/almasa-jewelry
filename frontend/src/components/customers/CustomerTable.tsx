"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CustomerOut } from "@/types/customer";
import { Edit2, Loader2, Users } from "lucide-react";

export function CustomerTable({
  customers,
  isLoading,
  onEdit,
}: {
  customers: CustomerOut[];
  isLoading: boolean;
  onEdit: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#262626] rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#c5a059]" />
        <span className="text-gray-400 font-medium">جاري تحميل العملاء...</span>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#262626] rounded-xl border-dashed">
        <Users className="h-10 w-10 text-[#262626] mb-4" />
        <span className="text-gray-500 font-medium">لا يوجد عملاء مطابقين للبحث.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#0a0a0a] border border-[#262626] rounded-xl">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-[#141414] border-b border-[#262626] text-gray-400 text-sm">
            <th className="p-4 font-medium whitespace-nowrap">الاسم</th>
            <th className="p-4 font-medium whitespace-nowrap">رقم الهاتف</th>
            <th className="p-4 font-medium whitespace-nowrap">البريد الإلكتروني</th>
            <th className="p-4 font-medium whitespace-nowrap">ملاحظات</th>
            <th className="p-4 font-medium whitespace-nowrap">تاريخ الإضافة</th>
            <th className="p-4 font-medium text-center whitespace-nowrap">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#262626]">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-[#141414]/50 transition-colors group">
              <td className="p-4 font-bold text-white whitespace-nowrap group-hover:text-[#c5a059] transition-colors">{customer.name}</td>
              <td dir="ltr" className="p-4 text-right font-mono text-gray-300 whitespace-nowrap">{customer.phone || "-"}</td>
              <td className="p-4 text-gray-400 whitespace-nowrap">{customer.email || "-"}</td>
              <td className="p-4 text-gray-400 max-w-[200px] truncate" title={customer.notes || ""}>
                {customer.notes || "-"}
              </td>
              <td className="p-4 text-gray-500 text-sm whitespace-nowrap font-mono">
                {format(new Date(customer.created_at), "dd MMM yyyy", { locale: ar })}
              </td>
              <td className="p-4 text-center whitespace-nowrap">
                <button
                  className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 rounded-md hover:bg-[#c5a059]/20 transition-colors"
                  onClick={() => onEdit(customer.id)}
                >
                  <Edit2 className="w-3.5 h-3.5 me-1.5" />
                  تعديل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
