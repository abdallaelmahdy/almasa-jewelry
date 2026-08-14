"use client";

import { useState } from "react";
import { useCustomers } from "@/hooks/useCustomers";
import { usePOSStore } from "@/stores/posStore";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      <div className="p-4 rounded-xl border border-border bg-primary/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full text-primary">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">العميل المحدد</div>
            <div className="font-bold text-lg">{customerName}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCustomer(null, null)}>
          <X className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن عميل برقم الهاتف أو الاسم..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="outline">
          <UserPlus className="w-4 h-4 me-2" />
          جديد
        </Button>
      </div>

      {debouncedQuery && isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {debouncedQuery && !isLoading && customers && customers.length > 0 && (
        <div className="border rounded-md divide-y divide-border bg-card">
          {customers.map((c) => (
            <div key={c.id} className="p-3 flex justify-between items-center hover:bg-muted/50 cursor-pointer" onClick={() => setCustomer(c.id, c.name)}>
              <div>
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-muted-foreground font-mono" dir="ltr">{c.phone || "بدون رقم"}</div>
              </div>
              <Button size="sm" variant="ghost">اختيار</Button>
            </div>
          ))}
        </div>
      )}

      {debouncedQuery && !isLoading && customers && customers.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
          لا يوجد عملاء مطابقين.
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
