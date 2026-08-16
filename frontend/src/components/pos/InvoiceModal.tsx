"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { usePOSStore } from "@/stores/posStore";
import { Printer, CheckCircle } from "lucide-react";

export function InvoiceModal() {
  const completedSale = usePOSStore((state) => state.completedSale);
  const setCompletedSale = usePOSStore((state) => state.setCompletedSale);
  const clearCart = usePOSStore((state) => state.clearCart);

  const isOpen = !!completedSale?.invoice;

  const handleClose = () => {
    setCompletedSale(null);
    clearCart();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!completedSale?.invoice) return null;

  const invoice = completedSale.invoice;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-[#111111] border border-[#D4AF37]/20 text-white p-0 rounded-xl overflow-hidden" dir="rtl">
        
        {/* Success Header */}
        <div className="bg-[#D4AF37]/10 p-6 flex items-center gap-4 border-b border-[#D4AF37]/20">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="font-display text-lg text-white">تمت عملية البيع بنجاح</h2>
            <p className="text-xs text-white/50 mt-0.5">فاتورة رقم {invoice.invoice_number}</p>
          </div>
          <button onClick={handlePrint} className="ms-auto bg-[#D4AF37] text-black px-4 py-2 rounded-lg hover:bg-[#F3E5AB] transition-colors flex items-center gap-2 text-sm font-bold">
            <Printer className="w-4 h-4" />
            طباعة
          </button>
        </div>

        {/* Invoice Items */}
        <div className="p-6">
          {invoice.items.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-white/5 mb-6">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-white/5 text-white/40">
                    <th className="px-3 py-2.5 font-medium">القطعة</th>
                    <th className="px-3 py-2.5 font-medium">الوزن</th>
                    <th className="px-3 py-2.5 font-medium">العيار</th>
                    <th className="px-3 py-2.5 font-medium">سعر الجرام</th>
                    <th className="px-3 py-2.5 font-medium">المصنعية</th>
                    <th className="px-3 py-2.5 font-medium">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-t border-white/5">
                      <td className="px-3 py-3 text-[#D4AF37] font-bold">{item.inventory_item_id.substring(0, 8)}</td>
                      <td className="px-3 py-3 text-white/70 font-numeric">{item.historical_weight}</td>
                      <td className="px-3 py-3 text-white/70 font-numeric">{item.historical_karat}</td>
                      <td className="px-3 py-3 text-white/70 font-numeric">{item.historical_gold_price_per_gram}</td>
                      <td className="px-3 py-3 text-white/70 font-numeric">{item.historical_manufacturing_fee}</td>
                      <td className="px-3 py-3 font-bold text-white font-numeric">{item.line_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between border-t border-[#D4AF37]/30 pt-4">
            <span className="text-sm font-bold text-[#D4AF37]">الإجمالي</span>
            <span className="text-xl font-extrabold text-[#D4AF37] font-numeric">
              {completedSale.total_amount} <span className="text-sm font-bold">ج.م</span>
            </span>
          </div>

          {/* Payments */}
          {completedSale.payments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-2">المدفوعات</h4>
              {completedSale.payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center py-1.5 text-xs">
                  <span className="text-white/60">{p.method}</span>
                  <span className="font-numeric text-white tracking-widest">{p.amount} EGP</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
