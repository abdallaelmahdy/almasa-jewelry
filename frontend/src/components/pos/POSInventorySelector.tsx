"use client";

import { useState } from "react";
import { useInventory, useLockInventory } from "@/hooks/useInventory";
import { usePOSStore } from "@/stores/posStore";
import { InventoryItemOut } from "@/types/inventory";
import { Loader2, Search, Plus } from "lucide-react";

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
      const lockedItem = await lockMutation.mutateAsync({
        id: item.id,
        payload: { reason: "POS_CHECKOUT", reference_type: "POS_CART" },
      });
      addItem(lockedItem);
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
        <Search className="absolute right-4 top-3.5 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
        <input
          placeholder="ابحث برقم القطعة (SKU) لإضافتها للسلة..."
          value={skuQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-white/[0.01] border-b border-white/10 py-3 px-10 text-white placeholder-white/30 focus:outline-none focus:border-primary focus:bg-white/[0.02] transition-all font-numeric tracking-widest rounded-none"
          dir="ltr"
        />
      </div>

      {errorMsg && (
        <div className="p-4 text-[10px] uppercase font-sans tracking-luxury bg-red-950/20 text-red-500 border-l-2 border-red-500">
          {errorMsg}
        </div>
      )}

      {debouncedSku && isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {debouncedSku && !isLoading && results && results.length === 0 && (
        <div className="font-sans text-[10px] uppercase tracking-luxury text-white/30 p-8 text-center border border-white/5 border-dashed bg-white/[0.01]">
          لا توجد قطع متاحة
        </div>
      )}

      {debouncedSku && !isLoading && results && results.length > 0 && (
        <div className="flex flex-col gap-0 border-t border-white/10">
          {results.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-transparent border-b border-white/5 hover:bg-white/[0.02] transition-colors flex justify-between items-center p-3"
            >
              <div className="flex flex-col gap-1">
                <div className="font-numeric font-bold text-white tracking-widest">{item.sku}</div>
                <div className="font-sans text-[10px] text-muted-foreground tracking-wide line-clamp-1">{item.product.name}</div>
                <div className="text-xs flex gap-3 text-white/50 font-medium mt-1">
                  <span className="font-sans text-[9px] uppercase tracking-luxury">الوزن: <span className="font-numeric text-primary tracking-widest ml-1">{item.weight}G</span></span>
                  <span className="font-sans text-[9px] uppercase tracking-luxury">العيار: <span className="font-numeric text-primary tracking-widest ml-1">{item.karat}</span></span>
                </div>
              </div>
              
              <button
                onClick={() => handleAdd(item)}
                disabled={lockingId === item.id || cartItems.some(i => i.id === item.id)}
                className="bg-white/[0.05] hover:bg-primary hover:text-black text-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/10 px-4 py-2 flex items-center justify-center rounded-none font-sans text-[10px] uppercase tracking-luxury min-w-[100px]"
              >
                {lockingId === item.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : cartItems.some(i => i.id === item.id) ? (
                  "في السلة"
                ) : (
                  <>
                    <Plus className="w-3 h-3 me-2" />
                    إضافة
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
