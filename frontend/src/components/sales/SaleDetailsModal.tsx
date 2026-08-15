"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthStore } from "@/stores/authStore";
import { useSale, useRefundSale } from "@/hooks/useSales";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Printer, Undo2, AlertCircle, FileText } from "lucide-react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

export function SaleDetailsModal({
  saleId,
  isOpen,
  onClose,
}: {
  saleId: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuthStore();
  const { data: sale, isLoading } = useSale(saleId);
  const refundMutation = useRefundSale();

  const [isConfirmingRefund, setIsConfirmingRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      setErrorMsg("الرجاء إدخال سبب الاسترداد");
      return;
    }

    setErrorMsg(null);
    try {
      await refundMutation.mutateAsync({
        id: saleId,
        payload: { reason: refundReason },
      });
      setIsConfirmingRefund(false);
      setRefundReason("");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "فشل إجراء الاسترداد");
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-[#0a0a0a] border border-[#262626] p-0 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="print-hidden bg-[#141414] border-b border-[#262626] p-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#141414] p-2 rounded-lg border border-[#c5a059]/30 text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.1)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {isLoading ? "جاري التحميل..." : `تفاصيل الفاتورة - ${sale?.invoice?.invoice_number || saleId}`}
              </DialogTitle>
            </div>
          </div>
        </div>

        {isLoading || !sale ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#c5a059]" />
          </div>
        ) : (
          <div className="p-6">
            {/* Printable Invoice Area (Clean White for Printing, but elegant on screen) */}
            <div className={`printable-invoice p-8 rounded-xl shadow-inner min-h-[500px] border ${sale.status === "REFUNDED" ? "bg-[#fffafa] border-red-200 text-black" : "bg-white border-gray-200 text-black"}`} dir="rtl">
              
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-6 mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "#000" }}>مجوهرات الماسة</h1>
                <p className="text-gray-500 font-serif mb-4" style={{ letterSpacing: "2px" }}>ALMASA JEWELRY</p>
                
                <div className="flex justify-between items-end mt-6">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">رقم الفاتورة: <span className="font-mono text-black">{sale.invoice?.invoice_number || sale.id}</span></p>
                    <p className="text-xs text-gray-500 mt-1">التاريخ: {format(new Date(sale.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}</p>
                  </div>
                  {sale.status === "REFUNDED" && (
                    <div className="inline-block px-4 py-2 border-2 border-red-600 text-red-600 font-bold text-lg rounded transform -rotate-12 bg-white">
                      مسترجعة
                    </div>
                  )}
                </div>
              </div>

              {/* Customer & Info */}
              <div className="flex justify-between mb-8 text-sm">
                <div className="bg-gray-50 p-3 rounded border border-gray-100 flex-1 me-4">
                  <p className="text-gray-500 text-xs mb-1">بيانات العميل</p>
                  <p className="font-bold text-black">{sale.customer_id ? `رقم العميل: ${sale.customer_id}` : "عميل نقدي"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-100 flex-1 ms-4 text-left">
                  <p className="text-gray-500 text-xs mb-1">بيانات البائع</p>
                  <p className="font-bold text-black">رقم الموظف: {sale.user_id}</p>
                </div>
              </div>

              {/* Items */}
              <table className="w-full mb-8 text-sm text-right border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-50">
                    <th className="py-3 px-2 font-bold text-gray-800">رقم القطعة</th>
                    <th className="py-3 px-2 font-bold text-gray-800">العيار</th>
                    <th className="py-3 px-2 font-bold text-gray-800">الوزن</th>
                    <th className="py-3 px-2 font-bold text-gray-800">سعر الجرام</th>
                    <th className="py-3 px-2 font-bold text-gray-800">المصنعية</th>
                    <th className="py-3 px-2 font-bold text-gray-800">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.invoice?.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 px-2 font-mono text-gray-600">{item.inventory_item_id.split("-")[0]}</td>
                      <td className="py-3 px-2 font-mono">{item.historical_karat}K</td>
                      <td className="py-3 px-2 font-mono">{item.historical_weight}g</td>
                      <td className="py-3 px-2 font-mono">{item.historical_gold_price_per_gram}</td>
                      <td className="py-3 px-2 font-mono">{item.historical_manufacturing_fee}</td>
                      <td className="py-3 px-2 font-bold font-mono">{item.line_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-72 bg-gray-50 p-4 rounded border border-gray-200">
                  <div className="flex justify-between items-center font-bold text-xl text-black">
                    <span>المجموع الكلي:</span>
                    <span className="font-mono">{sale.total_amount} <span className="text-sm font-sans text-gray-500">ج.م</span></span>
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div className="mb-8 border-t border-gray-200 pt-6">
                <p className="font-bold text-sm text-gray-800 mb-3">تفاصيل الدفع:</p>
                <div className="text-sm text-gray-600 flex gap-4">
                  {sale.payments.map((p) => (
                    <div key={p.id} className="bg-gray-50 px-3 py-2 rounded border border-gray-100 flex items-center gap-2">
                      <span className="text-xs">{p.method}:</span>
                      <span className="font-mono font-bold text-black">{p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-12 text-sm text-gray-500 border-t border-gray-200 pt-6">
                <p className="font-bold text-black mb-1">شكراً لثقتكم بمجوهرات الماسة</p>
                <p className="text-xs">البضاعة المباعة ترد وتستبدل حسب الشروط</p>
              </div>
            </div>

            {/* Admin Refund Controls */}
            {user?.role === "admin" && sale.status === "COMPLETED" && (
              <div className="print-hidden mt-6 p-5 border border-red-900/30 bg-[#3f1414]/10 rounded-xl space-y-4">
                {!isConfirmingRefund ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        صلاحية الإدارة: استرداد الفاتورة
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        سيتم إرجاع القطع للمخزون وتسجيل حركة مالية بالاسترداد.
                      </p>
                    </div>
                    <button 
                      className="px-4 py-2 bg-red-950/50 hover:bg-red-900 border border-red-900/50 text-red-400 rounded-lg transition-colors flex items-center"
                      onClick={() => setIsConfirmingRefund(true)}
                    >
                      <Undo2 className="w-4 h-4 me-2" />
                      استرداد
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-bold text-red-400">تأكيد الاسترداد</h4>
                    <input
                      placeholder="سبب الاسترداد (مطلوب)..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
                    />
                    {errorMsg && <p className="text-sm text-red-400 font-bold">{errorMsg}</p>}
                    <div className="flex justify-end gap-2 mt-4">
                      <button 
                        className="px-4 py-2 border border-[#262626] text-gray-400 hover:text-white hover:bg-[#262626] rounded-lg transition-colors"
                        onClick={() => setIsConfirmingRefund(false)} 
                        disabled={refundMutation.isPending}
                      >
                        إلغاء
                      </button>
                      <button 
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center"
                        onClick={handleRefund} 
                        disabled={refundMutation.isPending}
                      >
                        {refundMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        تأكيد الاسترداد
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="print-hidden flex justify-end gap-3 mt-6 pt-6 border-t border-[#262626]">
              <button 
                className="px-6 py-2.5 rounded-xl border border-[#262626] text-gray-400 hover:text-white hover:bg-[#262626] transition-colors"
                onClick={onClose}
              >
                إغلاق
              </button>
              <LuxuryButton onClick={handlePrint} className="px-6 flex items-center">
                <Printer className="w-4 h-4 me-2" />
                طباعة الفاتورة
              </LuxuryButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
