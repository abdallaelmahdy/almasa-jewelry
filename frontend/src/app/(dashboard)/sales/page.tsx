"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSales } from "@/hooks/useSales";
import { SalesTable } from "@/components/sales/SalesTable";
import { SaleDetailsModal } from "@/components/sales/SaleDetailsModal";
import { FileText } from "lucide-react";

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
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center gap-4">
        <div className="bg-[#141414] p-4 rounded-xl border border-[#c5a059]/30 text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)]">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">سجل المبيعات</h2>
          <p className="text-gray-400 mt-2">
            استعراض الفواتير، المبيعات السابقة، ومعالجة الاسترجاع.
          </p>
        </div>
      </div>

      {isError ? (
        <div className="p-6 rounded-xl bg-red-950/50 text-red-400 border border-red-900/50 text-center shadow-lg">
          <span className="font-bold">حدث خطأ أثناء جلب المبيعات:</span> {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <SalesTable 
            sales={sales || []} 
            isLoading={isLoading} 
            onView={(id) => setSelectedSaleId(id)}
          />
          
          <div className="flex items-center justify-between p-4 border-t border-[#262626] bg-[#141414]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-4 py-2 border border-[#262626] rounded-md text-white hover:bg-[#262626] disabled:opacity-50 transition-colors"
            >
              السابق
            </button>
            <span className="text-sm text-gray-400 font-mono">الصفحة {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!sales || sales.length < limit || isLoading}
              className="px-4 py-2 border border-[#262626] rounded-md text-white hover:bg-[#262626] disabled:opacity-50 transition-colors"
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
