"use client";

import * as React from "react";
import { X, ShoppingBag, Trash2, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useCustomerCart } from "@/stores/customerCartStore";
import { useCustomerAuth } from "@/stores/customerAuthStore";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onRequestAuth: () => void;
}

export function CustomerCartSidebar({ open, onClose, onRequestAuth }: Props) {
  const { items, removeItem, clear } = useCustomerCart();
  const { customer, accessToken } = useCustomerAuth();
  const [isOrdering, setIsOrdering] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState(false);
  const [orderError, setOrderError] = React.useState<string | null>(null);

  const handleReserve = async () => {
    if (!customer) {
      onClose();
      onRequestAuth();
      return;
    }
    setIsOrdering(true);
    setOrderError(null);
    try {
      for (const item of items) {
        await api.post(
          "/orders",
          { inventory_item_id: item.id },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
      setOrderSuccess(true);
      clear();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setOrderError(typeof detail === "string" ? detail : "تعذر إتمام الحجز. قد تكون بعض القطع غير متاحة.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 start-0 z-[95] h-full w-full max-w-sm bg-[#0C0C0C] border-e border-white/8 flex flex-col transition-transform duration-500 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Gold accent */}
        <div className="h-[2px] w-full bg-gradient-to-l from-transparent via-[#D4AF37] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-display text-lg text-white">سلة التسوق</span>
            {items.length > 0 && (
              <span className="bg-[#D4AF37] text-black text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-white/30 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 && !orderSuccess && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <ShoppingBag className="w-12 h-12 text-white/10" />
              <p className="font-sans text-sm text-white/30">السلة فارغة</p>
              <p className="font-sans text-xs text-white/20">أضف قطعاً من المتجر</p>
            </div>
          )}

          {orderSuccess && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <CheckCircle className="w-14 h-14 text-emerald-400" />
              <p className="font-display text-xl text-white">تم الحجز بنجاح!</p>
              <p className="font-sans text-sm text-white/50">
                سيتواصل معك فريقنا لتأكيد الطلب وترتيب التسليم.
              </p>
              <button
                onClick={() => { setOrderSuccess(false); onClose(); }}
                className="mt-4 px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C04A] text-black font-bold text-sm rounded-lg transition-colors"
              >
                متابعة التسوق
              </button>
            </div>
          )}

          {!orderSuccess && items.map((item) => (
            <div key={item.id} className="flex gap-4 items-start p-4 rounded-xl border border-white/5 bg-white/[0.02] group">
              {/* Product image */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                {item.product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">
                    ✦
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-white truncate">{item.product.name}</p>
                <p className="font-sans text-xs text-white/40 mt-1">
                  عيار {item.karat} · {item.weight}غ
                </p>
                <p className="font-sans text-xs text-[#D4AF37]/80 mt-1">
                  {item.product.category.name}
                </p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {!orderSuccess && items.length > 0 && (
          <div className="px-6 py-6 border-t border-white/5 space-y-4">
            {/* Price note */}
            <div className="rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/15 p-4">
              <p className="font-sans text-xs text-[#D4AF37]/80 leading-relaxed">
                سيتم احتساب السعر النهائي بناءً على سعر الذهب في يوم التسليم. هذا الحجز مجاني ولا يُلزمك بالشراء.
              </p>
            </div>

            {orderError && (
              <p className="text-sm text-red-400 text-center">{orderError}</p>
            )}

            <button
              onClick={handleReserve}
              disabled={isOrdering}
              className="w-full h-12 bg-[#D4AF37] hover:bg-[#E5C04A] disabled:opacity-60 text-black font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isOrdering ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : customer ? (
                <>تأكيد الحجز <ArrowLeft className="w-4 h-4" /></>
              ) : (
                "سجّل دخولك للحجز"
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
