"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSales } from "@/hooks/useSales";
import { SalesTable } from "@/components/sales/SalesTable";
import { SaleDetailsModal } from "@/components/sales/SaleDetailsModal";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 p-3 rounded-xl text-primary">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">سجل المبيعات</h2>
          <p className="text-muted-foreground mt-1">
            استعراض الفواتير، المبيعات السابقة، ومعالجة الاسترجاع.
          </p>
        </div>
      </div>

      {isError ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-center">
          حدث خطأ أثناء جلب المبيعات: {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <SalesTable 
            sales={sales || []} 
            isLoading={isLoading} 
            onView={(id) => setSelectedSaleId(id)}
          />
          
          <div className="flex items-center justify-between p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              السابق
            </Button>
            <span className="text-sm text-muted-foreground">الصفحة {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!sales || sales.length < limit || isLoading}
            >
              التالي
            </Button>
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
