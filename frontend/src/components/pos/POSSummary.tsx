"use client";

import { usePOSStore } from "@/stores/posStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GoldPriceOut } from "@/types/sales";
import { Loader2, Receipt } from "lucide-react";
import { useEffect, useMemo } from "react";

export function POSSummary({ 
  onCheckout, 
  isSubmitting 
}: { 
  onCheckout: () => void;
  isSubmitting: boolean;
}) {
  const cartItems = usePOSStore((state) => state.cartItems);
  const payments = usePOSStore((state) => state.payments);

  const cartTotal = usePOSStore((state) => state.cartTotal);
  const setGoldPrices = usePOSStore((state) => state.setGoldPrices);

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

  useEffect(() => {
    if (recentPrices) {
      const pricesDict: Record<number, number> = {};
      recentPrices.forEach(p => {
        pricesDict[p.karat] = parseFloat(p.price_per_gram.toString());
      });
      setGoldPrices(pricesDict);
    }
  }, [recentPrices, setGoldPrices]);

  const totalWeight = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.weight), 0);
  }, [cartItems]);

  const canEstimate = recentPrices && recentPrices.length > 0;
  const totalPayments = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
  const canCheckout = cartItems.length > 0 && payments.length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 px-5 py-4 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          ملخص الفاتورة
        </h3>
        <span className="font-numeric text-[10px] text-[#D4AF37]/70 tracking-widest">
          {new Date().toISOString().split('T')[0]}
        </span>
      </div>

      {/* Summary Details */}
      <div className="p-5 space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/40">القطع</span>
            <span className="font-numeric text-white text-sm tracking-widest">{cartItems.length}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/40">الوزن</span>
            <span className="font-numeric text-white text-sm tracking-widest">{totalWeight.toFixed(2)} G</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/40">المجموع (تقديري)</span>
            <span className="font-numeric text-white text-sm tracking-widest">
              {canEstimate && cartItems.length > 0 ? `${cartTotal.toFixed(2)} EGP` : "-"}
            </span>
          </div>

          <div className="pt-3 mt-1 border-t border-white/10 border-dashed flex justify-between items-center">
            <span className="text-xs text-[#D4AF37]">المدفوعات</span>
            <span className="font-numeric text-[#D4AF37] font-bold text-sm tracking-widest">
              {totalPayments.toFixed(2)} EGP
            </span>
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="text-xs text-white">المتبقي</span>
          <span className="font-numeric text-white font-bold text-lg tracking-widest">
            {canEstimate && cartItems.length > 0 ? `${(cartTotal - totalPayments).toFixed(2)}` : "-"}
            <span className="text-[10px] text-white/30 ms-1">EGP</span>
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-4 shrink-0 border-t border-[#D4AF37]/20 bg-[#D4AF37]/5">
        <button 
          onClick={onCheckout}
          disabled={!canCheckout || isSubmitting}
          className="w-full h-12 bg-[#D4AF37] text-black text-sm font-bold rounded-lg transition-all duration-300 hover:bg-[#F3E5AB] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "إصدار الفاتورة"
          )}
        </button>
        
        {!canCheckout && cartItems.length > 0 && payments.length === 0 && (
          <p className="text-[10px] text-red-400 text-center mt-2">
            * يرجى إدخال دفعة
          </p>
        )}
      </div>
    </div>
  );
}
