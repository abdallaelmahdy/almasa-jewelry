"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSales } from "@/hooks/useSales";
import { SalesTable } from "@/components/sales/SalesTable";
import { SaleDetailsModal } from "@/components/sales/SaleDetailsModal";

export default function SalesPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: sales, isLoading, isError, error } = useSales({
    skip: (page - 1) * limit,
    limit,
  });

  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-white/5 gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl md:text-4xl text-white">المبيعات</h2>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
            ALMASA SALES LEDGER
          </p>
        </div>
      </div>

      {isError ? (
        <div className="p-4 bg-red-950/20 text-red-500 border-l-2 border-red-500 text-sm font-sans tracking-wide">
          <span className="font-bold">خطأ:</span> {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="border border-white/10 bg-transparent flex flex-col gap-0 overflow-hidden">
          <SalesTable 
            sales={sales || []} 
            isLoading={isLoading} 
            onView={(id) => setSelectedSaleId(id)}
          />
          
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/[0.02]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-6 py-2 border border-white/10 text-white hover:bg-white/[0.05] disabled:opacity-50 transition-colors font-sans text-[10px] uppercase tracking-luxury rounded-none"
            >
              السابق
            </button>
            <span className="font-sans text-[10px] uppercase tracking-luxury text-white/50">الصفحة {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!sales || sales.length < limit || isLoading}
              className="px-6 py-2 border border-white/10 text-white hover:bg-white/[0.05] disabled:opacity-50 transition-colors font-sans text-[10px] uppercase tracking-luxury rounded-none"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {selectedSaleId && (
        <SaleDetailsModal
          saleId={selectedSaleId}
          isOpen={!!selectedSaleId}
          onClose={() => setSelectedSaleId(null)}
        />
      )}
    </div>
  );
}
