"use client";

import { useState } from "react";
import { usePOSStore } from "@/stores/posStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={method} onValueChange={(v) => setMethod(v || "CASH")}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="طريقة الدفع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">نقدي</SelectItem>
            <SelectItem value="CARD">بطاقة</SelectItem>
            <SelectItem value="TRANSFER">حوالة بنكية</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="المبلغ..."
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
          className="flex-1 text-right"
          dir="ltr"
        />
        
        <Button onClick={handleAdd} variant="secondary">
          <Plus className="w-4 h-4 me-1" />
          إضافة دفعة
        </Button>
      </div>

      {payments.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-bold text-muted-foreground">الدفعات المسجلة</h4>
          <div className="border rounded-md divide-y divide-border bg-card">
            {payments.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center p-3">
                <div className="flex gap-4">
                  <span className="font-bold">{methodLabels[p.method] || p.method}</span>
                  <span className="font-mono">{p.amount} د.إ</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removePayment(idx)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
