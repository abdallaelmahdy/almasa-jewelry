"use client";

import { useState } from "react";
import { useInventory, useLockInventory } from "@/hooks/useInventory";
import { usePOSStore } from "@/stores/posStore";
import { InventoryItemOut } from "@/types/inventory";
import { Loader2, Search, Plus } from "lucide-react";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

export function POSInventorySelector() {
  const [skuQuery, setSkuQuery] = useState("");
  const [debouncedSku, setDebouncedSku] = useState("");
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addItem = usePOSStore((state) => state.addItem);
  const cartItems = usePOSStore((state) => state.cartItems);

  const lockMutation = useLockInventory();

  // Basic debounce
  const handleSearch = (val: string) => {
    setSkuQuery(val);
    setTimeout(() => {
      setDebouncedSku(val);
    }, 500);
  };

  const { data: results, isLoading } = useInventory({
    sku: debouncedSku || undefined,
    status: "AVAILABLE",
    limit: 5,
  });

  const handleAdd = async (item: InventoryItemOut) => {
    if (cartItems.some(i => i.id === item.id)) {
      setErrorMsg("القطعة مضافة مسبقاً للسلة");
      return;
    }

    setLockingId(item.id);
    setErrorMsg(null);
    try {
      // 1. Lock the inventory item
      const lockedItem = await lockMutation.mutateAsync({
        id: item.id,
        payload: { reason: "POS_CHECKOUT", reference_type: "POS_CART" },
      });
      // 2. Add to local cart ONLY after successful lock
      addItem(lockedItem);
      // Reset search
      setSkuQuery("");
      setDebouncedSku("");
    } catch (err: any) {
      if (err?.response?.status === 409 || err?.response?.status === 403) {
        setErrorMsg("تعذر قفل القطعة، قد تكون مقفولة أو مباعة بواسطة موظف آخر.");
      } else {
        setErrorMsg(err?.response?.data?.detail || "حدث خطأ أثناء إضافة القطعة.");
      }
    } finally {
      setLockingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative group">
        <Search className="absolute right-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-[#c5a059] transition-colors" />
        <input
          placeholder="ابحث برقم القطعة (SKU) لإضافتها للسلة..."
          value={skuQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all font-mono"
          dir="ltr"
        />
      </div>

      {errorMsg && (
        <div className="p-4 text-sm bg-red-950/50 text-red-400 border border-red-900/50 rounded-xl">
          {errorMsg}
        </div>
      )}

      {debouncedSku && isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#c5a059]" />
        </div>
      )}

      {debouncedSku && !isLoading && results && results.length === 0 && (
        <div className="text-sm text-gray-500 p-8 text-center border border-[#262626] border-dashed rounded-xl bg-[#0a0a0a]">
          لا توجد قطع متاحة مطابقة لهذا الرقم.
        </div>
      )}

      {debouncedSku && !isLoading && results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-[#141414] border border-[#262626] rounded-xl overflow-hidden hover:border-[#c5a059]/30 transition-all flex flex-col"
            >
              <div className="relative h-40 bg-[#0a0a0a]">
                <ProductImageFallback
                  category="مجوهرات"
                  alt={item.product.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"></div>
                <div className="absolute top-3 right-3">
                  <span className="bg-[#c5a059] text-[#0d0d0d] text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
                    {item.karat} قيراط
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="font-mono font-bold text-white text-lg drop-shadow-md">{item.sku}</div>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-white font-medium text-sm line-clamp-1">{item.product.name}</h4>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>الوزن: <span className="font-mono text-[#c5a059]">{item.weight}g</span></span>
                    <span>الفئة: مجوهرات</span>
                  </div>
                </div>
                
                <LuxuryButton
                  onClick={() => handleAdd(item)}
                  disabled={lockingId === item.id || cartItems.some(i => i.id === item.id)}
                  className="w-full py-2 h-auto text-sm"
                >
                  {lockingId === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : cartItems.some(i => i.id === item.id) ? (
                    "في السلة"
                  ) : (
                    <>
                      <Plus className="w-4 h-4 me-2" />
                      إضافة للسلة
                    </>
                  )}
                </LuxuryButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
