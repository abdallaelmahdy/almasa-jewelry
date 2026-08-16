"use client";

import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { usePOSStore } from "@/stores/posStore";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { Loader2, Search, UserCheck, UserPlus, X } from "lucide-react";

export function POSCustomerSelector() {
  const customerId = usePOSStore((state) => state.customerId);
  const customerName = usePOSStore((state) => state.customerName);
  const setCustomer = usePOSStore((state) => state.setCustomer);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (val: string) => {
    setQuery(val);
    setTimeout(() => setDebouncedQuery(val), 500);
  };

  const { data: customers, isLoading } = useCustomers({
    q: debouncedQuery || undefined,
    limit: 5,
  });

  if (customerId && customerName) {
    return (
      <div className="p-3 border border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded-lg flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-[#D4AF37]/10 p-2 rounded-lg border border-[#D4AF37]/20">
            <UserCheck className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase mb-0.5">العميل المحدد</div>
            <div className="text-sm text-white">{customerName}</div>
          </div>
        </div>
        <button 
          onClick={() => setCustomer(null, null)}
          className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="إلغاء التحديد"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-0 border border-white/10 rounded-lg overflow-hidden">
        <div className="relative flex-1 group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-[#D4AF37] transition-colors" />
          <input
            placeholder="البحث برقم الهاتف أو الاسم..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-full bg-[#0A0A0A] border-none py-2.5 pe-10 ps-4 text-sm text-white placeholder-white/30 focus:outline-none transition-all"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-4 bg-white/5 border-s border-white/10 text-white/70 hover:bg-[#D4AF37] hover:text-black text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <UserPlus className="w-3 h-3" />
          جديد
        </button>
      </div>

      {debouncedQuery && isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
        </div>
      )}

      {debouncedQuery && !isLoading && customers && customers.length > 0 && (
        <div className="border border-white/10 rounded-lg overflow-hidden flex flex-col">
          {customers.map((c) => (
            <div 
              key={c.id} 
              className="p-3 flex justify-between items-center hover:bg-white/[0.03] border-b border-white/5 last:border-b-0 cursor-pointer transition-colors group" 
              onClick={() => setCustomer(c.id, c.name)}
            >
              <div className="flex flex-col gap-0.5">
                <div className="text-xs text-white group-hover:text-[#D4AF37] transition-colors">{c.name}</div>
                <div className="font-numeric text-[10px] text-white/40 tracking-widest" dir="ltr">{c.phone || "بدون رقم"}</div>
              </div>
              <button className="text-[10px] font-bold text-[#D4AF37] px-3 py-1 bg-[#D4AF37]/10 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                اختيار
              </button>
            </div>
          ))}
        </div>
      )}

      {debouncedQuery && !isLoading && customers && customers.length === 0 && (
        <div className="text-xs text-white/30 p-4 text-center border border-white/5 border-dashed rounded-lg bg-white/[0.01]">
          لا يوجد عملاء مطابقين
        </div>
      )}

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={null}
      />
    </div>
  );
}
