"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { SaleOut } from "@/types/sales";
import { usePOSStore } from "@/stores/posStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle2 } from "lucide-react";

export function InvoiceModal() {
  const completedSale = usePOSStore((state) => state.completedSale);
  const setCompletedSale = usePOSStore((state) => state.setCompletedSale);

  const isOpen = !!completedSale;

  const handleClose = () => {
    setCompletedSale(null);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!completedSale || !completedSale.invoice) return null;

  const invoice = completedSale.invoice;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="print-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-6 h-6" />
              تمت عملية البيع بنجاح
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Printable Invoice Area */}
        <div className="printable-invoice p-8 bg-white text-black rounded-lg min-h-[500px]" dir="rtl">
          
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">مجوهرات الماسة</h1>
            <p className="text-gray-600">Almasa Jewelry</p>
            <p className="text-sm mt-2">رقم الفاتورة: <span className="font-mono font-bold">{invoice.invoice_number}</span></p>
            <p className="text-sm">التاريخ: {format(new Date(invoice.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}</p>
          </div>

          {/* Customer & Info */}
          <div className="flex justify-between mb-8 text-sm">
            <div>
              <p className="font-bold mb-1">العميل:</p>
              <p>{completedSale.customer_id ? `رقم العميل: ${completedSale.customer_id}` : "عميل نقدي"}</p>
            </div>
            <div className="text-left">
              <p className="font-bold mb-1">البائع:</p>
              <p>رقم الموظف: {completedSale.user_id}</p>
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
              {invoice.items.map((item) => (
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
                <span>{completedSale.total_amount} د.إ</span>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="mb-8">
            <p className="font-bold mb-2">الدفعات:</p>
            <div className="text-sm text-gray-600">
              {completedSale.payments.map((p) => (
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

        <div className="print-hidden flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClose}>
            إغلاق
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Printer className="w-4 h-4 me-2" />
            طباعة الفاتورة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
