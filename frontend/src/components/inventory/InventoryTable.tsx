"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { InventoryItemOut } from "@/types/inventory";
import { User } from "@/types/auth";
import { useLockInventory, useUnlockInventory } from "@/hooks/useInventory";
import { Lock, Unlock, Loader2, Key } from "lucide-react";

export function InventoryTable({
  items,
  isLoading,
  user,
}: {
  items: InventoryItemOut[];
  isLoading: boolean;
  user: User;
}) {
  const lockMutation = useLockInventory();
  const unlockMutation = useUnlockInventory();

  const [operatingId, setOperatingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#142617] text-[#4ade80] border border-[#4ade80]/20">متاح</span>;
      case "LOCKED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3b2a0c] text-[#fbbf24] border border-[#fbbf24]/20">مقفول</span>;
      case "SOLD":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#141414] text-gray-400 border border-[#262626]">مباع</span>;
      case "RETURNED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3f1414] text-[#f87171] border border-[#f87171]/20">مسترجع</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#141414] text-gray-400 border border-[#262626]">{status}</span>;
    }
  };

  const handleLock = async (id: string) => {
    setOperatingId(id);
    try {
      await lockMutation.mutateAsync({
        id,
        payload: { reason: "POS_CHECKOUT", reference_type: "MANUAL_LOCK" },
      });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "حدث خطأ أثناء القفل");
    } finally {
      setOperatingId(null);
    }
  };

  const handleUnlock = async (id: string) => {
    setOperatingId(id);
    try {
      await unlockMutation.mutateAsync({
        id,
        payload: { reason: "MANUAL_UNLOCK" },
      });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "حدث خطأ أثناء الفتح (قد لا تملك الصلاحية)");
    } finally {
      setOperatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#262626] rounded-none">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#c5a059]" />
        <span className="text-gray-400 font-medium">جاري تحميل المخزون...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center bg-[#0a0a0a] border border-[#262626] rounded-none border-dashed">
        <Key className="h-10 w-10 text-[#262626] mb-4" />
        <span className="text-gray-500 font-medium">لا توجد قطع مطابقة للبحث.</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#0a0a0a] border border-[#262626] rounded-none">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-[#141414] border-b border-[#262626] text-gray-400 text-sm">
            <th className="p-4 font-medium whitespace-nowrap">رقم القطعة (SKU)</th>
            <th className="p-4 font-medium whitespace-nowrap">المنتج</th>
            <th className="p-4 font-medium whitespace-nowrap">الوزن</th>
            <th className="p-4 font-medium whitespace-nowrap">العيار</th>
            <th className="p-4 font-medium whitespace-nowrap">الحالة</th>
            <th className="p-4 font-medium whitespace-nowrap">تاريخ الإضافة</th>
            <th className="p-4 font-medium text-center whitespace-nowrap">إجراءات القفل</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#262626]">
          {items.map((item) => {
            const isLocked = item.status === "LOCKED";
            const isAvailable = item.status === "AVAILABLE";
            
            // Authorization logic for UI display only (Backend enforces this strictly)
            const canLock = isAvailable;
            const canUnlock = isLocked && (user.role === "admin" || user.id === item.locked_by_id);
            const isOperating = operatingId === item.id;

            return (
              <tr key={item.id} className="hover:bg-[#141414]/50 transition-colors">
                <td className="p-4 font-mono font-bold text-white whitespace-nowrap">{item.sku}</td>
                <td className="p-4 text-gray-300 font-medium whitespace-nowrap">{item.product.name}</td>
                <td className="p-4 whitespace-nowrap">
                  <span className="font-mono text-[#c5a059] bg-[#141414] px-2 py-1 rounded border border-[#262626]">
                    {item.weight} <span className="text-xs text-gray-500">g</span>
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className="bg-[#141414] text-gray-300 px-2 py-1 rounded border border-[#262626] font-mono">
                    {item.karat}
                  </span>
                </td>
                <td className="p-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1.5 items-start">
                    <div>{getStatusBadge(item.status)}</div>
                    {isLocked && item.locked_by_id && (
                      <span className="text-[10px] text-gray-500 bg-[#141414] px-1.5 py-0.5 rounded flex items-center gap-1 border border-[#262626]">
                        <Key className="w-3 h-3" />
                        موظف رقم: {item.locked_by_id}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-gray-500 text-sm whitespace-nowrap font-mono">
                  {format(new Date(item.created_at), "dd MMM yyyy", { locale: ar })}
                </td>
                <td className="p-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    {canLock && (
                      <button
                        className="flex items-center justify-center px-3 py-1.5 text-xs font-bold text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/20 rounded-none hover:bg-[#fbbf24]/20 transition-colors disabled:opacity-50"
                        onClick={() => handleLock(item.id)}
                        disabled={isOperating}
                      >
                        {isOperating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5 me-1.5" />}
                        قفل
                      </button>
                    )}
                    {canUnlock && (
                      <button
                        className="flex items-center justify-center px-3 py-1.5 text-xs font-bold text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-none hover:bg-[#4ade80]/20 transition-colors disabled:opacity-50"
                        onClick={() => handleUnlock(item.id)}
                        disabled={isOperating}
                      >
                        {isOperating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5 me-1.5" />}
                        {user.role === "admin" && user.id !== item.locked_by_id ? "فتح إجباري" : "فتح"}
                      </button>
                    )}
                    {!canLock && !canUnlock && (
                      <span className="text-xs text-gray-600 font-mono">-</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
