"use client";

import { useState } from "react";
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
        idempotency_key: idempotencyKey, // Crucial: maintains idempotency on network retry
      };

      const sale = await checkoutMutation.mutateAsync(payload);
      
      // On success, backend accepted it or returned the existing sale for this idempotency key
      setCompletedSale(sale);
      clearCart();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Idempotency conflict or inventory lock conflict from another user
        setErrorMsg(`خطأ تعارض: ${err?.response?.data?.detail || "تم إجراء هذه العملية مسبقاً أو القطعة مباعة."}`);
      } else {
        setErrorMsg(`فشل إتمام البيع: ${err?.response?.data?.detail || "تأكد من الاتصال بالخادم وحاول مجدداً."}`);
      }
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <div className="bg-[#141414] p-4 rounded-xl border border-[#c5a059]/30 text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">نقطة البيع (POS)</h2>
          <p className="text-gray-400 mt-2">
            إدارة سلة المشتريات، إضافة العملاء، وإصدار الفواتير.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/50 text-red-400 border border-red-900/50 rounded-xl text-lg font-bold text-center shadow-lg">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Column: Cart & Items */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <LuxuryCard className="bg-[#0d0d0d] border-[#262626]">
            <LuxuryCardHeader className="border-b border-[#262626] pb-4">
              <LuxuryCardTitle className="flex items-center gap-2 text-white">
                <Box className="w-5 h-5 text-[#c5a059]" />
                1. اختيار القطع
              </LuxuryCardTitle>
            </LuxuryCardHeader>
            <LuxuryCardContent className="pt-6">
              <POSInventorySelector />
            </LuxuryCardContent>
          </LuxuryCard>

          <LuxuryCard className="bg-[#0d0d0d] border-[#262626]">
            <LuxuryCardHeader className="border-b border-[#262626] pb-4">
              <LuxuryCardTitle className="flex items-center gap-2 text-white">
                <ShoppingBag className="w-5 h-5 text-[#c5a059]" />
                سلة المشتريات
              </LuxuryCardTitle>
            </LuxuryCardHeader>
            <LuxuryCardContent className="pt-6">
              <POSCart />
            </LuxuryCardContent>
          </LuxuryCard>
        </div>

        {/* Right Column: Customer, Payment & Summary */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          <div className="sticky top-6 space-y-8">
            <LuxuryCard className="bg-[#0d0d0d] border-[#262626]">
              <LuxuryCardHeader className="border-b border-[#262626] pb-4">
                <LuxuryCardTitle className="flex items-center gap-2 text-white text-lg">
                  <UserSquare2 className="w-5 h-5 text-[#c5a059]" />
                  2. ربط العميل (اختياري)
                </LuxuryCardTitle>
              </LuxuryCardHeader>
              <LuxuryCardContent className="pt-6">
                <POSCustomerSelector />
              </LuxuryCardContent>
            </LuxuryCard>

            <LuxuryCard className="bg-[#0d0d0d] border-[#262626]">
              <LuxuryCardHeader className="border-b border-[#262626] pb-4">
                <LuxuryCardTitle className="flex items-center gap-2 text-white text-lg">
                  <Wallet className="w-5 h-5 text-[#c5a059]" />
                  3. تسجيل الدفعات
                </LuxuryCardTitle>
              </LuxuryCardHeader>
              <LuxuryCardContent className="pt-6">
                <POSPaymentForm />
              </LuxuryCardContent>
            </LuxuryCard>

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
