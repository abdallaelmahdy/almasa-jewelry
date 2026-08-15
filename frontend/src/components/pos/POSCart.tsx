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
      <div className="flex flex-col items-center justify-center p-12 text-center border border-white/5 border-dashed bg-white/[0.01]">
        <div className="w-12 h-12 flex items-center justify-center mb-4 border border-white/10 bg-white/[0.02]">
          <PackageSearch className="w-5 h-5 text-white/30" />
        </div>
        <p className="font-sans text-xs uppercase tracking-luxury text-white/50">السلة فارغة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-4 text-[10px] uppercase font-sans tracking-luxury bg-red-950/20 text-red-500 border-l-2 border-red-500">
          {errorMsg}
        </div>
      )}
      <div className="border-t border-white/10 flex flex-col gap-0">
        {cartItems.map((item) => (
          <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.02] border-b border-white/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div>
                <div className="font-numeric font-bold text-white tracking-widest">{item.sku}</div>
                <div className="font-sans text-[10px] text-muted-foreground mt-1 tracking-wide">
                  {item.product.name}
                </div>
                <div className="text-xs flex gap-3 text-white/50 mt-2 font-medium">
                  <span className="font-sans text-[9px] uppercase tracking-luxury">
                    الوزن: <span className="font-numeric text-primary tracking-widest ml-1">{item.weight}G</span>
                  </span>
                  <span className="font-sans text-[9px] uppercase tracking-luxury">
                    العيار: <span className="font-numeric text-primary tracking-widest ml-1">{item.karat}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleRemove(item.id)}
              disabled={unlockingId === item.id}
              className="text-white/30 hover:text-red-500 p-2 border border-transparent hover:border-red-500/30 hover:bg-red-500/10 transition-all self-end sm:self-auto disabled:opacity-50"
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
