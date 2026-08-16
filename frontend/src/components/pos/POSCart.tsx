"use client";

import { useState } from "react";
import { usePOSStore } from "@/stores/posStore";
import { useUnlockInventory } from "@/hooks/useInventory";
import { Loader2, Trash2, PackageSearch } from "lucide-react";

export function POSCart() {
  const cartItems = usePOSStore((state) => state.cartItems);
  const removeItem = usePOSStore((state) => state.removeItem);
  const unlockMutation = useUnlockInventory();

  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setUnlockingId(id);
    setErrorMsg(null);
    try {
      await unlockMutation.mutateAsync({
        id,
        payload: { reason: "MANUAL_UNLOCK" },
      });
      removeItem(id);
    } catch (err: any) {
      setErrorMsg("فشل إزالة القطعة من السلة (تعذر الفتح في الخادم). الرجاء المحاولة مرة أخرى.");
    } finally {
      setUnlockingId(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <div className="w-12 h-12 flex items-center justify-center mb-4 rounded-xl bg-white/5 border border-white/10">
          <PackageSearch className="w-5 h-5 text-white/20" />
        </div>
        <p className="text-xs text-white/40">السلة فارغة</p>
        <p className="text-[10px] text-white/20 mt-1">ابحث عن قطعة بالـ SKU لإضافتها</p>
      </div>
    );
  }

  return (
    <div>
      {errorMsg && (
        <div className="mx-4 mt-3 p-3 text-xs bg-red-950/20 text-red-400 border border-red-500/20 rounded-lg">
          {errorMsg}
        </div>
      )}
      <div className="flex flex-col">
        {cartItems.map((item) => (
          <div key={item.id} className="p-4 flex justify-between items-center hover:bg-white/[0.02] border-b border-white/5 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <div className="font-numeric font-bold text-white tracking-widest text-sm">{item.sku}</div>
                <div className="text-[11px] text-white/50 mt-1 truncate">
                  {item.product.name}
                </div>
                <div className="text-xs flex gap-3 text-white/40 mt-1.5">
                  <span>الوزن: <span className="font-numeric text-[#D4AF37] ms-1">{item.weight}G</span></span>
                  <span>العيار: <span className="font-numeric text-[#D4AF37] ms-1">{item.karat}</span></span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleRemove(item.id)}
              disabled={unlockingId === item.id}
              className="text-white/20 hover:text-red-400 p-2 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10 transition-all shrink-0 disabled:opacity-50"
              title="إزالة من السلة"
            >
              {unlockingId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
