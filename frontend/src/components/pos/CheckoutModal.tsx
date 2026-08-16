"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POSPaymentForm } from "@/components/pos/POSPaymentForm";
import { usePOSStore } from "@/stores/posStore";
import { Loader2, Check } from "lucide-react";

export function CheckoutModal({
  isOpen,
  onClose,
  onCheckout,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  isSubmitting: boolean;
}) {
  const cartTotal = usePOSStore((state) => state.cartTotal);
  const payments = usePOSStore((state) => state.payments);
  
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const isPaidInFull = totalPaid >= cartTotal && cartTotal > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-[#111111] border border-[#D4AF37]/20 text-white rounded-xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white mb-2">الدفع</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-[#0A0A0A] p-4 rounded-lg border border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm text-white/60">
              <span>إجمالي الفاتورة</span>
              <span className="font-bold text-white font-numeric">{cartTotal.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} EGP</span>
            </div>
            <div className="flex justify-between items-center text-sm text-white/60 border-b border-white/5 pb-2">
              <span>إجمالي المدفوع</span>
              <span className="font-bold text-[#D4AF37] font-numeric">{totalPaid.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} EGP</span>
            </div>
            <div className="flex justify-between items-center text-base pt-1">
              <span className="text-white/80">المتبقي</span>
              <span className={`font-bold font-numeric ${cartTotal - totalPaid > 0 ? "text-red-400" : "text-green-400"}`}>
                {Math.max(0, cartTotal - totalPaid).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} EGP
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <POSPaymentForm />

          {/* Checkout Action */}
          <button
            onClick={onCheckout}
            disabled={!isPaidInFull || isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            إتمام البيع
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
