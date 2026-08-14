"use client";

import { useInventoryValuation } from "@/hooks/useReports";
import { Loader2, Package, Scale } from "lucide-react";

export function InventoryValuationCard() {
  const { data: valuation, isLoading, isError } = useInventoryValuation();

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm h-full flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !valuation) {
    return (
      <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive shadow-sm h-full flex items-center justify-center text-center">
        تعذر تحميل تقييم المخزون الحالي
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/20 p-2 rounded-lg text-primary">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">تقييم المخزون الحالي</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          يمثل هذا التقييم إجمالي قيمة البضاعة المتاحة والمقفولة حالياً بناءً على تكلفة الشراء الأساسية (Cost Basis).
        </p>

        <div className="space-y-6">
          <div className="p-4 border border-border rounded-lg bg-background">
            <div className="text-sm text-muted-foreground mb-1">إجمالي التكلفة</div>
            <div className="text-3xl font-bold font-mono text-foreground">
              {Number(valuation.total_cost_basis).toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg font-sans text-muted-foreground">د.إ</span>
            </div>
          </div>

          <div className="p-4 border border-border rounded-lg bg-background flex items-center gap-4">
            <div className="p-3 bg-muted rounded-full">
              <Scale className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">الوزن الإجمالي</div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {Number(valuation.total_weight).toLocaleString("en-AE", { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-sm font-sans text-muted-foreground">جم</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
