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
      <div className="p-4 border border-primary/20 bg-primary/5 flex justify-between items-center transition-all">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 border border-primary/20">
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="font-sans text-[9px] font-bold tracking-luxury text-primary uppercase mb-1">العميل المحدد</div>
            <div className="font-sans text-sm text-white tracking-wide">{customerName}</div>
          </div>
        </div>
        <button 
          onClick={() => setCustomer(null, null)}
          className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="إلغاء التحديد"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-0 border border-white/10">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-3.5 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input
            placeholder="البحث برقم الهاتف أو الاسم..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-full bg-white/[0.01] border-none py-3 px-10 text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.03] transition-all font-sans text-xs tracking-wide rounded-none"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-6 bg-white/[0.05] border-r border-white/10 text-white/70 hover:bg-primary hover:text-black font-sans text-[10px] uppercase tracking-luxury transition-colors flex items-center justify-center rounded-none"
        >
          <UserPlus className="w-3 h-3 me-2" />
          جديد
        </button>
      </div>

      {debouncedQuery && isLoading && (
        <div className="flex justify-center p-6 border border-white/5 bg-white/[0.01]">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {debouncedQuery && !isLoading && customers && customers.length > 0 && (
        <div className="border border-white/10 flex flex-col gap-0 bg-transparent">
          {customers.map((c) => (
            <div 
              key={c.id} 
              className="p-3 flex justify-between items-center hover:bg-white/[0.02] border-b border-white/5 last:border-b-0 cursor-pointer transition-colors group" 
              onClick={() => setCustomer(c.id, c.name)}
            >
              <div className="flex flex-col gap-1">
                <div className="font-sans text-xs text-white group-hover:text-primary transition-colors">{c.name}</div>
                <div className="font-numeric text-[10px] text-white/50 tracking-widest" dir="ltr">{c.phone || "بدون رقم"}</div>
              </div>
              <button className="font-sans text-[9px] uppercase tracking-luxury font-bold text-primary px-3 py-1.5 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-none">
                اختيار
              </button>
            </div>
          ))}
        </div>
      )}

      {debouncedQuery && !isLoading && customers && customers.length === 0 && (
        <div className="font-sans text-[10px] uppercase tracking-luxury text-white/30 p-6 text-center border border-white/5 border-dashed bg-white/[0.01]">
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
