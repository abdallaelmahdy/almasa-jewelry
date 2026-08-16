"use client";

import { useState, useRef, useEffect } from "react";
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && results && results.length > 0) {
      e.preventDefault();
      // Add the first item automatically
      if (!cartItems.some(i => i.id === results[0].id) && !lockingId) {
        await handleAdd(results[0]);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-[#D4AF37] transition-colors" />
        <input
          ref={searchInputRef}
          placeholder="ابحث برقم القطعة (SKU) لإضافتها للسلة..."
          value={skuQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2.5 pe-10 ps-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-all font-numeric tracking-widest"
          dir="ltr"
        />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 text-xs bg-red-950/20 text-red-400 border border-red-500/20 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Loading */}
      {debouncedSku && isLoading && (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
        </div>
      )}

      {/* No Results */}
      {debouncedSku && !isLoading && results && results.length === 0 && (
        <div className="text-xs text-white/30 p-6 text-center border border-white/5 border-dashed rounded-lg bg-white/[0.01]">
          لا توجد قطع متاحة
        </div>
      )}

      {/* Results */}
      {debouncedSku && !isLoading && results && results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((item) => (
            <div 
              key={item.id} 
              className="group bg-[#0A0A0A] border border-white/5 hover:border-[#D4AF37]/30 rounded-lg transition-colors flex justify-between items-center p-3"
            >
              <div className="flex flex-col gap-1">
                <div className="font-numeric font-bold text-white tracking-widest text-sm">{item.sku}</div>
                <div className="text-[11px] text-white/50 line-clamp-1">{item.product.name}</div>
                <div className="text-xs flex gap-3 text-white/40 mt-1">
                  <span>الوزن: <span className="font-numeric text-[#D4AF37] ms-1">{item.weight}G</span></span>
                  <span>العيار: <span className="font-numeric text-[#D4AF37] ms-1">{item.karat}</span></span>
                </div>
              </div>
              
              <button
                onClick={() => handleAdd(item)}
                disabled={lockingId === item.id || cartItems.some(i => i.id === item.id)}
                className="bg-white/5 hover:bg-[#D4AF37] hover:text-black text-white/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-white/10 hover:border-[#D4AF37] px-4 py-2 flex items-center justify-center rounded-lg text-xs min-w-[90px]"
              >
                {lockingId === item.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : cartItems.some(i => i.id === item.id) ? (
                  "في السلة"
                ) : (
                  <>
                    <Plus className="w-3 h-3 me-1" />
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
