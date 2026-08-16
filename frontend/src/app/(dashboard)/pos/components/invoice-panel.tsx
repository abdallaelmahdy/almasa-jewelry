"use client";

import { Printer, Loader2, Trash2 } from "lucide-react";

export type InvoiceRowData = {
  id: string;
  name: string;
  weight: string;
  qty: string;
  gram: string;
  craft: string;
  total: string;
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-white/40">{label}</span>
      <span className="text-sm text-white/85">{value}</span>
    </div>
  );
}

export function InvoicePanel({
  invoiceNumber,
  customerName,
  customerPhone,
  date,
  totalItems,
  rows,
  subTotal,
  totalManufacturing,
  finalTotal,
  onPrint,
  isSubmitting,
  onRemoveItem,
  onCustomerClick,
}: {
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  totalItems: string;
  rows: InvoiceRowData[];
  subTotal: string;
  totalManufacturing: string;
  finalTotal: string;
  onPrint: () => void;
  isSubmitting: boolean;
  onRemoveItem: (id: string) => void;
  onCustomerClick: () => void;
}) {
  const columns = ["الصنف", "الوزن", "الكمية", "الجرام", "المصنعية", "الإجمالي"];

  const summary = [
    { label: "المجموع الفرعي", value: subTotal, suffix: "ج.م" },
    { label: "المصنعية", value: totalManufacturing, suffix: "ج.م" },
  ];

  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/5 bg-panel p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">فاتورة رقم #{invoiceNumber}</h2>
        <button
          onClick={onPrint}
          disabled={rows.length === 0 || isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-gold-soft disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Printer className="h-3.5 w-3.5" />
          )}
          <span>طباعة</span>
        </button>
      </div>

      {/* Customer details */}
      <div 
        onClick={onCustomerClick}
        className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-b border-white/5 pb-5 cursor-pointer hover:bg-white/[0.02] p-2 -mx-2 rounded-lg transition-colors group"
      >
        <Detail label="اسم العميل" value={customerName} />
        <Detail label="رقم الهاتف" value={customerPhone} />
        <Detail label="التاريخ" value={date} />
        <Detail label="المنتجات" value={totalItems} />
        <div className="col-span-2 text-center text-[10px] text-white/20 group-hover:text-gold/60 transition-colors mt-[-4px]">
          انقر لتحديد أو تغيير العميل
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-white/5 flex-1 flex flex-col min-h-0">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-right text-xs">
            <thead className="sticky top-0 bg-panel z-10 shadow-sm">
              <tr className="bg-white/5 text-white/45">
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2.5 font-medium whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-white/20 text-xs">
                    لا توجد منتجات
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="border-t border-white/5 hover:bg-white/[0.02] group transition-colors"
                  >
                    <td className="px-3 py-3 font-bold text-gold whitespace-nowrap flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onRemoveItem(row.id); }}
                        className="opacity-0 group-hover:opacity-100 text-red-400/50 hover:text-red-400 transition-all p-1 -ms-2 rounded cursor-pointer"
                        title="إزالة القطعة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span>{row.name}</span>
                    </td>
                    <td className="px-3 py-3 text-white/70">{row.weight}</td>
                    <td className="px-3 py-3 text-white/70">{row.qty}</td>
                    <td className="px-3 py-3 text-white/70">{row.gram}</td>
                    <td className="px-3 py-3 text-white/70">{row.craft}</td>
                    <td className="px-3 py-3 font-bold text-white">{row.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial summary */}
      <div className="mt-auto flex flex-col gap-3 pt-6 shrink-0">
        {summary.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-white/45">{item.label}</span>
            <span className="text-white/85">
              {item.value} <span className="text-xs text-white/50">{item.suffix}</span>
            </span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-gold/30 pt-4">
          <span className="text-sm font-bold text-gold">الإجمالي</span>
          <span className="text-xl font-extrabold text-gold">
            {finalTotal} <span className="text-sm font-bold">ج.م</span>
          </span>
        </div>
      </div>
    </section>
  );
}
