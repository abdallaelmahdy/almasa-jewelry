"use client";

import { useState } from "react";
import { usePOSStore } from "@/stores/posStore";
import { Plus, Trash2, CreditCard, Banknote, Building } from "lucide-react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

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
      <div className="flex flex-col sm:flex-row gap-3">
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value)}
          className="bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors sm:w-[180px] appearance-none"
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
            className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all font-mono text-left"
            dir="ltr"
          />
          <span className="absolute left-4 top-3.5 text-gray-500 text-sm font-medium">EGP</span>
        </div>
        
        <LuxuryButton onClick={handleAdd} className="h-auto py-3" title="إضافة دفعة">
          <Plus className="w-5 h-5" />
        </LuxuryButton>
      </div>

      {payments.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="text-sm font-bold text-gray-400">الدفعات المسجلة</h4>
          <div className="border border-[#262626] rounded-xl divide-y divide-[#262626] bg-[#0a0a0a] overflow-hidden">
            {payments.map((p, idx) => {
              const Icon = methodIcons[p.method] || Banknote;
              return (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-[#141414] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#141414] p-2 rounded-lg border border-[#262626]">
                      <Icon className="w-5 h-5 text-[#c5a059]" />
                    </div>
                    <span className="font-bold text-white">{methodLabels[p.method] || p.method}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-lg text-white font-medium">{p.amount} <span className="text-sm text-[#c5a059]">ج.م</span></span>
                    <button 
                      onClick={() => removePayment(idx)} 
                      className="text-gray-500 hover:text-red-400 p-2 rounded-md hover:bg-red-950/30 transition-all"
                      title="حذف الدفعة"
                    >
                      <Trash2 className="w-5 h-5" />
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
