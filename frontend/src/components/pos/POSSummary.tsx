"use client";

import { usePOSStore } from "@/stores/posStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GoldPriceOut } from "@/types/sales";
import { Loader2, CheckCircle, Receipt } from "lucide-react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

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
  let totalWeight = 0;
  let canEstimate = true;

  if (cartItems.length > 0) {
    for (const item of cartItems) {
      totalWeight += parseFloat(item.weight);
      if (recentPrices) {
        const currentPrice = recentPrices.find(p => p.karat === item.karat);
        if (!currentPrice) {
          canEstimate = false;
        } else {
          const itemPrice = parseFloat(currentPrice.price_per_gram) * parseFloat(item.weight) + parseFloat(item.manufacturing_fee);
          estimatedTotal += itemPrice;
        }
      } else {
        canEstimate = false;
      }
    }
  } else {
    canEstimate = false;
  }

  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const canCheckout = cartItems.length > 0 && payments.length > 0;

  return (
    <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl flex flex-col relative overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-[#141414] border-b border-[#262626] p-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Receipt className="w-6 h-6 text-[#c5a059]" />
          ملخص الفاتورة
        </h3>
        <span className="text-xs font-mono text-gray-500 bg-[#0d0d0d] px-2 py-1 rounded border border-[#262626]">
          {new Date().toISOString().split('T')[0]}
        </span>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">عدد القطع:</span>
            <span className="font-mono text-white font-medium">{cartItems.length}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">إجمالي الوزن:</span>
            <span className="font-mono text-white font-medium">{totalWeight.toFixed(2)} جرام</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">الإجمالي التقديري:</span>
            <span className="font-mono text-white font-medium">
              {canEstimate && cartItems.length > 0 ? `${estimatedTotal.toFixed(2)} ج.م` : "-"}
            </span>
          </div>

          <div className="pt-4 mt-2 border-t border-[#262626] border-dashed flex justify-between items-center">
            <span className="text-gray-400 font-medium">المدفوع:</span>
            <span className="font-mono text-white font-bold text-lg">
              {totalPayments.toFixed(2)} ج.م
            </span>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-lg p-4 flex justify-between items-center">
          <span className="text-[#c5a059] font-bold">الصافي للدفع</span>
          <span className="font-mono text-white font-bold text-2xl tracking-tight">
            {canEstimate && cartItems.length > 0 ? `${(estimatedTotal - totalPayments).toFixed(2)}` : "-"}
            <span className="text-sm text-[#c5a059] ml-1">ج.م</span>
          </span>
        </div>

        <div className="pt-4">
          <LuxuryButton 
            onClick={onCheckout}
            disabled={!canCheckout || isSubmitting}
            className="w-full h-14 text-lg font-bold"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5 me-2" />
                تأكيد وإصدار الفاتورة
              </>
            )}
          </LuxuryButton>
          
          {!canCheckout && cartItems.length > 0 && payments.length === 0 && (
            <p className="text-xs text-red-400 text-center mt-3 bg-red-950/20 py-2 rounded">
              الرجاء إضافة دفعة واحدة على الأقل لإتمام البيع.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
