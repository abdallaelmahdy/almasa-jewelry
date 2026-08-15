"use client";

import { usePOSStore } from "@/stores/posStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GoldPriceOut } from "@/types/sales";
import { Loader2, CheckCircle, Receipt } from "lucide-react";

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
    <div className="flex flex-col relative overflow-hidden h-full">
      {/* Invoice Header */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between shrink-0">
        <h3 className="font-sans text-[11px] uppercase tracking-luxury-wide text-primary flex items-center gap-2">
          <Receipt className="w-3.5 h-3.5" />
          ملخص الفاتورة
        </h3>
        <span className="font-numeric text-[9px] text-primary/70 tracking-widest">
          {new Date().toISOString().split('T')[0]}
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-sans text-[10px] uppercase tracking-luxury text-white/50">القطع</span>
            <span className="font-numeric text-white text-sm tracking-widest">{cartItems.length}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-sans text-[10px] uppercase tracking-luxury text-white/50">الوزن</span>
            <span className="font-numeric text-white text-sm tracking-widest">{totalWeight.toFixed(2)} G</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-sans text-[10px] uppercase tracking-luxury text-white/50">المجموع (تقديري)</span>
            <span className="font-numeric text-white text-sm tracking-widest">
              {canEstimate && cartItems.length > 0 ? `${estimatedTotal.toFixed(2)} EGP` : "-"}
            </span>
          </div>

          <div className="pt-3 mt-1 border-t border-white/10 border-dashed flex justify-between items-center">
            <span className="font-sans text-[10px] uppercase tracking-luxury text-primary">المدفوعات</span>
            <span className="font-numeric text-primary font-bold text-sm tracking-widest">
              {totalPayments.toFixed(2)} EGP
            </span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 px-3 py-2 flex justify-between items-center">
          <span className="font-sans text-[10px] uppercase tracking-luxury text-white">المتبقي</span>
          <span className="font-numeric text-white font-bold text-lg tracking-widest">
            {canEstimate && cartItems.length > 0 ? `${(estimatedTotal - totalPayments).toFixed(2)}` : "-"}
            <span className="font-sans text-[9px] text-white/40 tracking-luxury ml-1">EGP</span>
          </span>
        </div>
      </div>

      <div className="p-4 pt-0 shrink-0 border-t border-primary/20 bg-primary/5">
        <button 
          onClick={onCheckout}
          disabled={!canCheckout || isSubmitting}
          className="w-full h-12 mt-4 bg-primary text-[#080808] font-sans text-[11px] uppercase tracking-luxury-wide font-bold transition-all duration-300 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "إصدار الفاتورة"
          )}
        </button>
        
        {!canCheckout && cartItems.length > 0 && payments.length === 0 && (
          <p className="font-sans text-[9px] uppercase tracking-luxury-wide text-red-400 text-center mt-3">
            * يرجى إدخال دفعة
          </p>
        )}
      </div>
    </div>
  );
}
