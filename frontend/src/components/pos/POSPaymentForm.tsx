"use client";

import { useState, useEffect, useRef } from "react";
import { usePOSStore } from "@/stores/posStore";
import { Plus, Trash2, CreditCard, Banknote, Building } from "lucide-react";

export function POSPaymentForm() {
  const payments = usePOSStore((state) => state.payments);
  const addPayment = usePOSStore((state) => state.addPayment);
  const removePayment = usePOSStore((state) => state.removePayment);

  const [method, setMethod] = useState("CASH");
  const [amount, setAmount] = useState("");
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to focus payment amount (only if not typing in an input already)
      if (e.key === " " && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "SELECT") {
        e.preventDefault();
        amountInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAdd = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("الرجاء إدخال مبلغ صحيح أكبر من الصفر.");
      return;
    }
    
    addPayment({ method, amount: amount });
    setAmount("");
  };

  const methodLabels: Record<string, string> = {
    CASH: "نقدي",
    CARD: "بطاقة",
    TRANSFER: "حوالة بنكية",
  };

  const methodIcons: Record<string, any> = {
    CASH: Banknote,
    CARD: CreditCard,
    TRANSFER: Building,
  };

  return (
    <div className="space-y-4">
      {/* Payment Input Row */}
      <div className="flex gap-0 border border-white/10 rounded-lg overflow-hidden">
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value)}
          className="bg-[#0A0A0A] border-none border-e border-white/10 px-3 py-2.5 text-white focus:outline-none text-xs appearance-none min-w-[100px]"
        >
          <option value="CASH">نقدي</option>
          <option value="CARD">بطاقة إئتمان</option>
          <option value="TRANSFER">حوالة بنكية</option>
        </select>
        
        <div className="relative flex-1">
          <input
            ref={amountInputRef}
            placeholder="أدخل المبلغ..."
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="w-full h-full bg-white/[0.02] border-none py-2.5 px-3 text-white placeholder-white/20 focus:outline-none transition-all font-numeric tracking-widest text-left text-sm"
            dir="ltr"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">EGP</span>
        </div>
        
        <button 
          onClick={handleAdd} 
          className="bg-white/5 hover:bg-[#D4AF37] hover:text-black text-white/70 transition-colors border-s border-white/10 px-4 flex items-center justify-center" 
          title="إضافة دفعة"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Recorded Payments */}
      {payments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] text-white/30 uppercase tracking-wider">المدفوعات المسجلة</h4>
          <div className="border border-white/10 rounded-lg overflow-hidden flex flex-col">
            {payments.map((p, idx) => {
              const Icon = methodIcons[p.method] || Banknote;
              return (
                <div key={idx} className="flex justify-between items-center p-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-xs text-white">{methodLabels[p.method] || p.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-numeric tracking-widest text-sm text-white">{p.amount} <span className="text-[10px] text-[#D4AF37] ms-1">EGP</span></span>
                    <button 
                      onClick={() => removePayment(idx)} 
                      className="text-white/20 hover:text-red-400 p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                      title="حذف الدفعة"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
