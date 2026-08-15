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
      <div className="p-4 rounded-xl border border-[#c5a059]/30 bg-[#c5a059]/5 flex justify-between items-center transition-all">
        <div className="flex items-center gap-4">
          <div className="bg-[#141414] p-3 rounded-full text-[#c5a059] border border-[#c5a059]/20 shadow-[0_0_15px_rgba(197,160,89,0.1)]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-[#c5a059] uppercase mb-1">العميل المحدد</div>
            <div className="font-bold text-lg text-white">{customerName}</div>
          </div>
        </div>
        <button 
          onClick={() => setCustomer(null, null)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-[#262626] transition-colors"
          title="إلغاء التحديد"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-3.5 h-4 w-4 text-gray-500 group-focus-within:text-[#c5a059] transition-colors" />
          <input
            placeholder="ابحث برقم الهاتف أو الاسم..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all font-mono"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="px-4 bg-[#141414] border border-[#262626] text-white hover:border-[#c5a059]/50 hover:text-[#c5a059] rounded-xl flex items-center transition-colors"
        >
          <UserPlus className="w-4 h-4 me-2" />
          جديد
        </button>
      </div>

      {debouncedQuery && isLoading && (
        <div className="flex justify-center p-6">
          <Loader2 className="w-6 h-6 animate-spin text-[#c5a059]" />
        </div>
      )}

      {debouncedQuery && !isLoading && customers && customers.length > 0 && (
        <div className="border border-[#262626] rounded-xl divide-y divide-[#262626] bg-[#0a0a0a] overflow-hidden shadow-lg">
          {customers.map((c) => (
            <div 
              key={c.id} 
              className="p-4 flex justify-between items-center hover:bg-[#141414] cursor-pointer transition-colors group" 
              onClick={() => setCustomer(c.id, c.name)}
            >
              <div>
                <div className="font-bold text-white group-hover:text-[#c5a059] transition-colors">{c.name}</div>
                <div className="text-sm text-gray-500 font-mono mt-1" dir="ltr">{c.phone || "بدون رقم"}</div>
              </div>
              <button className="text-xs font-bold text-[#c5a059] px-3 py-1.5 rounded bg-[#c5a059]/10 opacity-0 group-hover:opacity-100 transition-opacity">
                اختيار
              </button>
            </div>
          ))}
        </div>
      )}

      {debouncedQuery && !isLoading && customers && customers.length === 0 && (
        <div className="text-sm text-gray-500 p-6 text-center border border-[#262626] border-dashed rounded-xl bg-[#0a0a0a]">
          لا يوجد عملاء مطابقين للبحث.
        </div>
      )}

      {/* Reusing the CustomerFormModal from step 5 */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={null}
      />
    </div>
  );
}
