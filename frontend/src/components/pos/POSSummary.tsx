"use client";

import { usePOSStore } from "@/stores/posStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GoldPriceOut } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

export function POSSummary({ 
  onCheckout, 
  isSubmitting 
}: { 
  onCheckout: () => void;
  isSubmitting: boolean;
}) {
  const cartItems = usePOSStore((state) => state.cartItems);
  const payments = usePOSStore((state) => state.payments);

  // Fetch recent gold prices to attempt a rough estimate display
  const { data: recentPrices } = useQuery({
    queryKey: ["recentGoldPrices"],
    queryFn: async () => {
      const { data } = await api.get<GoldPriceOut[]>("/gold-prices", {
        params: { limit: 20 },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Calculate optimistic total
  let estimatedTotal = 0;
  let canEstimate = true;

  if (cartItems.length > 0 && recentPrices) {
    for (const item of cartItems) {
      const currentPrice = recentPrices.find(p => p.karat === item.karat);
      if (!currentPrice) {
        canEstimate = false;
        break;
      }
      const itemPrice = parseFloat(currentPrice.price_per_gram) * parseFloat(item.weight) + parseFloat(item.manufacturing_fee);
      estimatedTotal += itemPrice;
    }
  } else {
    canEstimate = false;
  }

  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const canCheckout = cartItems.length > 0 && payments.length > 0;

  return (
    <div className="p-6 bg-card border border-border rounded-xl shadow-lg flex flex-col gap-6">
      <h3 className="text-xl font-bold border-b border-border pb-3">ملخص الفاتورة</h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>عدد القطع:</span>
          <span className="font-mono text-foreground font-bold">{cartItems.length}</span>
        </div>
        
        <div className="flex justify-between items-center text-muted-foreground">
          <span>الإجمالي التقديري:</span>
          <span className="font-mono text-foreground font-bold text-lg">
            {canEstimate && cartItems.length > 0 ? `${estimatedTotal.toFixed(2)} د.إ` : "-"}
          </span>
        </div>

        <div className="flex justify-between items-center text-muted-foreground pt-3 border-t border-border">
          <span>إجمالي الدفعات:</span>
          <span className="font-mono text-green-500 font-bold text-xl">
            {totalPayments.toFixed(2)} د.إ
          </span>
        </div>
      </div>

      <Button 
        size="lg" 
        className="w-full font-bold text-lg h-14" 
        onClick={onCheckout}
        disabled={!canCheckout || isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-5 h-5 me-2" />
            تأكيد وإصدار الفاتورة
          </>
        )}
      </Button>
      
      {!canCheckout && cartItems.length > 0 && payments.length === 0 && (
        <p className="text-sm text-destructive text-center">الرجاء إضافة دفعة واحدة على الأقل لإتمام البيع.</p>
      )}
    </div>
  );
}
