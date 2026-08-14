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
import { ShoppingCart } from "lucide-react";

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">نقطة البيع (POS)</h2>
          <p className="text-muted-foreground mt-1">
            إدارة سلة المشتريات، إضافة العملاء، وإصدار الفواتير.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-lg font-bold text-center">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Cart & Items */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">1. اختيار القطع</h3>
            <POSInventorySelector />
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">سلة المشتريات</h3>
            <POSCart />
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">2. ربط العميل (اختياري)</h3>
            <POSCustomerSelector />
          </div>

          <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">3. تسجيل الدفعات</h3>
            <POSPaymentForm />
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
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
