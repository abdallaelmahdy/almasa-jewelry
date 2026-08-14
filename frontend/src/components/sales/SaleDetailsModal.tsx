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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Printer, Undo2, AlertCircle } from "lucide-react";

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="print-hidden">
          <DialogHeader>
            <DialogTitle>
              {isLoading ? "جاري التحميل..." : `تفاصيل الفاتورة - ${sale?.invoice?.invoice_number || saleId}`}
            </DialogTitle>
          </DialogHeader>
        </div>

        {isLoading || !sale ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Printable Invoice Area (Reused structure) */}
            <div className={`printable-invoice p-8 rounded-lg min-h-[500px] ${sale.status === "REFUNDED" ? "bg-red-50 text-black" : "bg-white text-black"}`} dir="rtl">
              
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-6 mb-6">
                <h1 className="text-3xl font-bold mb-2">مجوهرات الماسة</h1>
                <p className="text-gray-600">Almasa Jewelry</p>
                <p className="text-sm mt-2">رقم الفاتورة: <span className="font-mono font-bold">{sale.invoice?.invoice_number || sale.id}</span></p>
                <p className="text-sm">التاريخ: {format(new Date(sale.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}</p>
                {sale.status === "REFUNDED" && (
                  <div className="mt-4 inline-block px-4 py-2 border-2 border-red-600 text-red-600 font-bold text-xl rounded transform -rotate-6">
                    فاتورة مسترجعة (REFUNDED)
                  </div>
                )}
              </div>

              {/* Customer & Info */}
              <div className="flex justify-between mb-8 text-sm">
                <div>
                  <p className="font-bold mb-1">العميل:</p>
                  <p>{sale.customer_id ? `رقم العميل: ${sale.customer_id}` : "عميل نقدي"}</p>
                </div>
                <div className="text-left">
                  <p className="font-bold mb-1">البائع:</p>
                  <p>رقم الموظف: {sale.user_id}</p>
                </div>
              </div>

              {/* Items */}
              <table className="w-full mb-8 text-sm text-right">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-2">رقم القطعة</th>
                    <th className="py-2">العيار</th>
                    <th className="py-2">الوزن</th>
                    <th className="py-2">سعر الجرام</th>
                    <th className="py-2">المصنعية</th>
                    <th className="py-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.invoice?.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 font-mono">{item.inventory_item_id.split("-")[0]}</td>
                      <td className="py-3">{item.historical_karat}K</td>
                      <td className="py-3">{item.historical_weight}g</td>
                      <td className="py-3">{item.historical_gold_price_per_gram}</td>
                      <td className="py-3">{item.historical_manufacturing_fee}</td>
                      <td className="py-3 font-bold">{item.line_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between border-b border-gray-200 py-2 font-bold text-lg">
                    <span>المجموع الكلي:</span>
                    <span>{sale.total_amount} د.إ</span>
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div className="mb-8">
                <p className="font-bold mb-2">الدفعات:</p>
                <div className="text-sm text-gray-600">
                  {sale.payments.map((p) => (
                    <div key={p.id} className="flex justify-between w-48 mb-1">
                      <span>{p.method}:</span>
                      <span className="font-mono">{p.amount} د.إ</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-12 text-sm text-gray-500">
                <p>شكراً لثقتكم بمجوهرات الماسة</p>
                <p>البضاعة المباعة ترد وتستبدل حسب الشروط</p>
              </div>
            </div>

            {/* Admin Refund Controls */}
            {user?.role === "admin" && sale.status === "COMPLETED" && (
              <div className="print-hidden mt-6 p-4 border border-destructive/20 bg-destructive/5 rounded-lg space-y-4">
                {!isConfirmingRefund ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-destructive flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        صلاحية الإدارة: استرداد الفاتورة
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        سيتم إرجاع القطع للمخزون وتسجيل حركة مالية بالاسترداد.
                      </p>
                    </div>
                    <Button variant="destructive" onClick={() => setIsConfirmingRefund(true)}>
                      <Undo2 className="w-4 h-4 me-2" />
                      استرداد
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-bold text-destructive">تأكيد الاسترداد</h4>
                    <Input
                      placeholder="سبب الاسترداد (مطلوب)..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                    />
                    {errorMsg && <p className="text-sm text-destructive font-bold">{errorMsg}</p>}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsConfirmingRefund(false)} disabled={refundMutation.isPending}>
                        إلغاء
                      </Button>
                      <Button variant="destructive" onClick={handleRefund} disabled={refundMutation.isPending}>
                        {refundMutation.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                        تأكيد الاسترداد
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="print-hidden flex justify-end gap-2 mt-4 pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                إغلاق
              </Button>
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Printer className="w-4 h-4 me-2" />
                طباعة الفاتورة
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
