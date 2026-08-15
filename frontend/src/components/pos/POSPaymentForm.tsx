"use client";

import { useState } from "react";
import { usePOSStore } from "@/stores/posStore";
import { Plus, Trash2, CreditCard, Banknote, Building } from "lucide-react";

export function POSPaymentForm() {
  const payments = usePOSStore((state) => state.payments);
  const addPayment = usePOSStore((state) => state.addPayment);
  const removePayment = usePOSStore((state) => state.removePayment);

  const [method, setMethod] = useState("CASH");
  const [amount, setAmount] = useState("");

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-0 border border-white/10">
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value)}
          className="bg-transparent border-none border-b sm:border-b-0 sm:border-l border-white/10 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors sm:w-[150px] appearance-none rounded-none font-sans text-xs"
        >
          <option value="CASH">نقدي</option>
          <option value="CARD">بطاقة إئتمان</option>
          <option value="TRANSFER">حوالة بنكية</option>
        </select>
        
        <div className="relative flex-1">
          <input
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
            className="w-full h-full bg-white/[0.02] border-none py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-numeric tracking-widest text-left rounded-none"
            dir="ltr"
          />
          <span className="absolute left-4 top-3.5 text-white/40 font-sans text-[9px] uppercase tracking-luxury">EGP</span>
        </div>
        
        <button 
          onClick={handleAdd} 
          className="bg-white/[0.05] hover:bg-primary hover:text-black text-white/70 transition-colors border-t sm:border-t-0 sm:border-r border-white/10 px-6 py-3 flex items-center justify-center rounded-none" 
          title="إضافة دفعة"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {payments.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-sans text-[10px] uppercase tracking-luxury text-white/40">المدفوعات المسجلة</h4>
          <div className="border border-white/10 flex flex-col gap-0 bg-transparent">
            {payments.map((p, idx) => {
              const Icon = methodIcons[p.method] || Banknote;
              return (
                <div key={idx} className="flex justify-between items-center p-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="font-sans text-xs text-white">{methodLabels[p.method] || p.method}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-numeric tracking-widest text-white">{p.amount} <span className="font-sans text-[10px] uppercase tracking-luxury text-primary ml-1">EGP</span></span>
                    <button 
                      onClick={() => removePayment(idx)} 
                      className="text-white/30 hover:text-red-500 p-2 transition-all border border-transparent hover:border-red-500/30 hover:bg-red-500/10"
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
