"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AuditLogOut } from "@/types/audit";
import { Loader2 } from "lucide-react";


export function AuditTable({
  logs,
  isLoading,
}: {
  logs: AuditLogOut[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center bg-[#0a0a0a] min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#c5a059]" />
        جاري تحميل السجلات...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 bg-[#0a0a0a] min-h-[300px] flex items-center justify-center border border-[#262626] border-dashed rounded-xl m-4">
        لا توجد سجلات مطابقة.
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    if (action.includes("LOGIN") || action.includes("AUTH")) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-[#142617] text-[#4ade80] border border-[#4ade80]/20">{action}</span>;
    }
    if (action.includes("LOCK") || action.includes("UNLOCK")) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-[#3b2a0c] text-[#fbbf24] border border-[#fbbf24]/20">{action}</span>;
    }
    if (action.includes("SALE")) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-[#1a143f] text-[#a78bfa] border border-[#a78bfa]/20">{action}</span>;
    }
    if (action.includes("REFUND")) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-[#3f1414] text-[#f87171] border border-[#f87171]/20">{action}</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono bg-[#141414] text-gray-400 border border-[#262626]">{action}</span>;
  };

  return (
    <div className="overflow-x-auto bg-[#0a0a0a]">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-[#141414] border-b border-[#262626] text-gray-400 text-sm">
            <th className="p-4 font-medium whitespace-nowrap">التاريخ والوقت</th>
            <th className="p-4 font-medium whitespace-nowrap">رقم الموظف</th>
            <th className="p-4 font-medium whitespace-nowrap">نوع الحركة</th>
            <th className="p-4 font-medium whitespace-nowrap">المرجع (Resource)</th>
            <th className="p-4 font-medium whitespace-nowrap">القيم الجديدة</th>
            <th className="p-4 font-medium whitespace-nowrap">IP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#262626]">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-[#141414]/50 transition-colors">
              <td className="p-4 text-gray-400 text-xs font-mono whitespace-nowrap">
                {format(new Date(log.created_at), "dd MMM yyyy - hh:mm:ss a", { locale: ar })}
              </td>
              <td className="p-4 font-bold text-white whitespace-nowrap">
                {log.user_id}
              </td>
              <td className="p-4 whitespace-nowrap">
                {getActionBadge(log.action_type)}
              </td>
              <td className="p-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                {log.resource_id}
              </td>
              <td className="p-4 text-xs max-w-xs truncate" title={log.new_values ? JSON.stringify(log.new_values) : ""}>
                {log.new_values ? (
                  <span className="font-mono bg-[#141414] text-gray-400 p-1.5 rounded border border-[#262626]">
                    {JSON.stringify(log.new_values).substring(0, 50)}
                    {JSON.stringify(log.new_values).length > 50 ? "..." : ""}
                  </span>
                ) : (
                  <span className="text-gray-600">-</span>
                )}
              </td>
              <td className="p-4 font-mono text-xs text-gray-500 whitespace-nowrap" dir="ltr">
                {log.ip_address || "127.0.0.1"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
