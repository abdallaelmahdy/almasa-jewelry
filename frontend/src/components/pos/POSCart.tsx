"use client";

import { useState } from "react";
import { usePOSStore } from "@/stores/posStore";
import { useUnlockInventory } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

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
      <div className="p-8 text-center text-muted-foreground border rounded-xl border-dashed">
        السلة فارغة. ابحث عن قطع لإضافتها.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
          {errorMsg}
        </div>
      )}
      <div className="border rounded-xl divide-y divide-border bg-card overflow-hidden">
        {cartItems.map((item) => (
          <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="font-mono font-bold text-lg">{item.sku}</div>
              <div className="text-muted-foreground text-sm">
                {item.product.name}
              </div>
              <div className="text-sm mt-1 flex gap-4">
                <span>الوزن: <span className="font-mono text-foreground">{item.weight}</span> جم</span>
                <span>العيار: <span className="font-mono text-foreground">{item.karat}</span> قيراط</span>
              </div>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleRemove(item.id)}
              disabled={unlockingId === item.id}
            >
              {unlockingId === item.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 me-2" />
                  حذف
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
