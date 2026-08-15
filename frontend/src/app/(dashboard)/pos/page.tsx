"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { usePOSStore } from "@/stores/posStore";
import { useCheckout } from "@/hooks/usePOS";
import { POSInventorySelector } from "@/components/pos/POSInventorySelector";
import { POSCart } from "@/components/pos/POSCart";
import { POSCustomerSelector } from "@/components/pos/POSCustomerSelector";
import { POSPaymentForm } from "@/components/pos/POSPaymentForm";
import { POSSummary } from "@/components/pos/POSSummary";
import { InvoiceModal } from "@/components/pos/InvoiceModal";
import { ShoppingBag, Box, UserSquare2, Wallet } from "lucide-react";
import { LuxuryCard, LuxuryCardContent, LuxuryCardHeader, LuxuryCardTitle } from "@/components/luxury/LuxuryCard";

export default function POSPage() {
  const { user } = useAuthStore();
  const { 
    cartItems, 
    customerId, 
    payments, 
    idempotencyKey, 
    setCompletedSale,
    clearCart
  } = usePOSStore();
  
  const checkoutMutation = useCheckout();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    if (payments.length === 0) {
      setErrorMsg("الرجاء إضافة دفعة واحدة على الأقل.");
      return;
    }

    setErrorMsg(null);
    try {
      const payload = {
        inventory_item_ids: cartItems.map(i => i.id),
        customer_id: customerId,
        payments: payments.map(p => ({
          method: p.method,
          amount: parseFloat(p.amount.toString()),
        })),
        idempotency_key: idempotencyKey, 
      };

      const sale = await checkoutMutation.mutateAsync(payload);
      
      setCompletedSale(sale);
      clearCart();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setErrorMsg(`خطأ تعارض: ${err?.response?.data?.detail || "تم إجراء هذه العملية مسبقاً أو القطعة مباعة."}`);
      } else {
        setErrorMsg(`فشل إتمام البيع: ${err?.response?.data?.detail || "تأكد من الاتصال بالخادم وحاول مجدداً."}`);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-[1920px] mx-auto px-4 py-4 gap-4 bg-background">
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-2xl text-white tracking-wide">نقطة البيع</h2>
          <span className="h-4 w-px bg-white/20"></span>
          <span className="font-sans text-[10px] text-white/50 uppercase tracking-luxury-wide">
            ALMASA POS TERMINAL
          </span>
        </div>
        <div className="font-numeric text-sm tracking-widest text-primary/80">
          Terminal ID: {user?.username?.toUpperCase() || "SYS"} / 01
        </div>
      </div>

      {errorMsg && (
        <div className="shrink-0 p-3 bg-red-950/40 text-red-400 border border-red-500/50 text-xs font-sans tracking-wide">
          {errorMsg}
        </div>
      )}

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
        {/* Left/Main Column: Cart & Items */}
        <div className="flex-[2] min-w-0 flex flex-col gap-4 h-full">
          {/* Inventory Selection */}
          <div className="flex-[2] min-h-0 flex flex-col border border-white/10 bg-black/20">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <Box className="w-3.5 h-3.5 text-primary" />
              <span className="font-sans text-[11px] text-white uppercase tracking-luxury-wide">1. اختيار القطع</span>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              <POSInventorySelector />
            </div>
          </div>

          {/* Cart */}
          <div className="flex-[1] min-h-0 flex flex-col border border-white/10 bg-black/20">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <ShoppingBag className="w-3.5 h-3.5 text-primary" />
              <span className="font-sans text-[11px] text-white uppercase tracking-luxury-wide">سلة المشتريات</span>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              <POSCart />
            </div>
          </div>
        </div>

        {/* Right Column: Customer, Payment & Summary */}
        <div className="flex-[1] min-w-0 lg:max-w-[450px] flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col border border-white/10 bg-black/20 shrink-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <UserSquare2 className="w-3.5 h-3.5 text-primary" />
              <span className="font-sans text-[11px] text-white uppercase tracking-luxury-wide">2. ربط العميل (اختياري)</span>
            </div>
            <div className="p-4">
              <POSCustomerSelector />
            </div>
          </div>

          <div className="flex flex-col border border-white/10 bg-black/20 shrink-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span className="font-sans text-[11px] text-white uppercase tracking-luxury-wide">3. تسجيل الدفعات</span>
            </div>
            <div className="p-4">
              <POSPaymentForm />
            </div>
          </div>

          <div className="mt-auto shrink-0 border border-primary/20 bg-primary/5">
            <POSSummary 
              onCheckout={handleCheckout} 
              isSubmitting={checkoutMutation.isPending} 
            />
          </div>
        </div>
      </div>

      <InvoiceModal />
    </div>
  );
}
