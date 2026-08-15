"use client";

import { useState } from "react";
import { usePOSStore } from "@/stores/posStore";
import { useUnlockInventory } from "@/hooks/useInventory";
import { Loader2, Trash2, PackageSearch } from "lucide-react";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";

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
      // 1. Call unlock
      await unlockMutation.mutateAsync({
        id,
        payload: { reason: "MANUAL_UNLOCK" },
      });
      // 2. Remove from cart ONLY if unlock succeeds
      removeItem(id);
    } catch (err: any) {
      setErrorMsg("فشل إزالة القطعة من السلة (تعذر الفتح في الخادم). الرجاء المحاولة مرة أخرى.");
    } finally {
      setUnlockingId(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-[#262626] border-dashed rounded-xl bg-[#0a0a0a]">
        <div className="w-16 h-16 bg-[#141414] rounded-full flex items-center justify-center mb-4">
          <PackageSearch className="w-8 h-8 text-[#262626]" />
        </div>
        <p className="text-gray-500 font-medium">السلة فارغة</p>
        <p className="text-xs text-gray-600 mt-1">قم بالبحث عن القطع وإضافتها لبدء الفاتورة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-4 text-sm bg-red-950/50 text-red-400 border border-red-900/50 rounded-xl">
          {errorMsg}
        </div>
      )}
      <div className="border border-[#262626] rounded-xl divide-y divide-[#262626] bg-[#0a0a0a] overflow-hidden">
        {cartItems.map((item) => (
          <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#141414] transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#262626] bg-[#141414] flex-shrink-0">
                <ProductImageFallback
                  category="مجوهرات"
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-mono font-bold text-white text-lg">{item.sku}</div>
                <div className="text-gray-400 text-sm mb-1">
                  {item.product.name}
                </div>
                <div className="text-xs flex gap-3 text-gray-500 font-medium">
                  <span className="bg-[#141414] px-2 py-0.5 rounded border border-[#262626]">
                    وزن: <span className="font-mono text-[#c5a059]">{item.weight}g</span>
                  </span>
                  <span className="bg-[#141414] px-2 py-0.5 rounded border border-[#262626]">
                    عيار: <span className="font-mono text-[#c5a059]">{item.karat}</span>
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleRemove(item.id)}
              disabled={unlockingId === item.id}
              className="text-gray-500 hover:text-red-400 p-2 rounded-md hover:bg-red-950/30 transition-all self-end sm:self-auto disabled:opacity-50"
              title="إزالة من السلة"
            >
              {unlockingId === item.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
