"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useInventory } from "@/hooks/useInventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { IntakeModal } from "@/components/inventory/IntakeModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PackagePlus, Search } from "lucide-react";

export default function InventoryPage() {
  const { user } = useAuthStore();
  
  const [skuFilter, setSkuFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Derive filters for query
  const queryFilters = {
    skip: (page - 1) * limit,
    limit,
    ...(skuFilter && { sku: skuFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const { data: inventoryItems, isLoading, isError, error } = useInventory(queryFilters);

  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">إدارة المخزون</h2>
          <p className="text-muted-foreground mt-1">
            عرض وتتبع حالة القطع، قفل وفتح المخزون للبيع.
          </p>
        </div>
        
        {user.role === "admin" && (
          <Button onClick={() => setIsIntakeModalOpen(true)} className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4" />
            إضافة مخزون جديد
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم القطعة (SKU)..."
            value={skuFilter}
            onChange={(e) => {
              setSkuFilter(e.target.value);
              setPage(1);
            }}
            className="ps-9"
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val || "all");
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="حالة القطعة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="AVAILABLE">متاح (AVAILABLE)</SelectItem>
              <SelectItem value="LOCKED">مقفول (LOCKED)</SelectItem>
              <SelectItem value="SOLD">مباع (SOLD)</SelectItem>
              <SelectItem value="RETURNED">مسترجع (RETURNED)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Area */}
      {isError ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-center">
          حدث خطأ أثناء جلب البيانات: {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <InventoryTable 
            items={inventoryItems || []} 
            isLoading={isLoading} 
            user={user} 
          />
          
          {/* Simple Pagination */}
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
              disabled={!inventoryItems || inventoryItems.length < limit || isLoading}
            >
              التالي
            </Button>
          </div>
        </div>
      )}

      {/* Admin Intake Modal */}
      {user.role === "admin" && (
        <IntakeModal 
          isOpen={isIntakeModalOpen} 
          onClose={() => setIsIntakeModalOpen(false)} 
        />
      )}
    </div>
  );
}
