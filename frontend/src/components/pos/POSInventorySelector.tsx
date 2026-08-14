"use client";

import { useState } from "react";
import { useInventory, useLockInventory } from "@/hooks/useInventory";
import { usePOSStore } from "@/stores/posStore";
import { InventoryItemOut } from "@/types/inventory";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث برقم القطعة (SKU) لإضافتها للسلة..."
          value={skuQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="ps-9"
          dir="ltr"
        />
      </div>

      {errorMsg && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
          {errorMsg}
        </div>
      )}

      {debouncedSku && isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {debouncedSku && !isLoading && results && results.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
          لا توجد قطع متاحة مطابقة.
        </div>
      )}

      {debouncedSku && !isLoading && results && results.length > 0 && (
        <div className="border rounded-md divide-y divide-border bg-card">
          {results.map((item) => (
            <div key={item.id} className="p-3 flex justify-between items-center hover:bg-muted/50">
              <div>
                <div className="font-mono font-bold">{item.sku}</div>
                <div className="text-sm text-muted-foreground">
                  {item.product.name} - {item.weight} جم - {item.karat} قيراط
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAdd(item)}
                disabled={lockingId === item.id || cartItems.some(i => i.id === item.id)}
              >
                {lockingId === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 me-1" />
                    إضافة
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
