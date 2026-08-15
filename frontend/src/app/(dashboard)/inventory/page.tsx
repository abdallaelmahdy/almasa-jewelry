"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useInventory } from "@/hooks/useInventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { IntakeModal } from "@/components/inventory/IntakeModal";
import { PackagePlus, Search, PackageOpen } from "lucide-react";

export default function InventoryPage() {
  const { user } = useAuthStore();
  
  const [skuFilter, setSkuFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

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
    <div className="space-y-8 max-w-[1600px] mx-auto px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-white/5 gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl md:text-4xl text-white">المخزون</h2>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
            ALMASA INVENTORY MANAGEMENT
          </p>
        </div>
        
        {user.role === "admin" && (
          <button 
            onClick={() => setIsIntakeModalOpen(true)} 
            className="flex items-center gap-2 px-6 h-12 bg-primary text-[#080808] hover:bg-primary/90 font-sans text-[10px] uppercase tracking-luxury font-bold transition-all duration-500 rounded-none"
          >
            <PackagePlus className="w-4 h-4" />
            إضافة مخزون جديد
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-0 border border-white/10">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-3.5 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input
            placeholder="البحث برقم القطعة (SKU)..."
            value={skuFilter}
            onChange={(e) => {
              setSkuFilter(e.target.value);
              setPage(1);
            }}
            className="w-full h-full bg-white/[0.01] border-none py-3 px-10 text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.03] transition-all font-numeric tracking-widest rounded-none"
            dir="ltr"
          />
        </div>
        
        <div className="w-full sm:w-64 border-t sm:border-t-0 sm:border-r border-white/10">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value || "all");
              setPage(1);
            }}
            className="w-full h-full bg-white/[0.01] border-none px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors appearance-none font-sans text-[10px] uppercase tracking-luxury rounded-none"
          >
            <option value="all">الكل</option>
            <option value="AVAILABLE">متاح (AVAILABLE)</option>
            <option value="LOCKED">مقفول (LOCKED)</option>
            <option value="SOLD">مباع (SOLD)</option>
            <option value="RETURNED">مسترجع (RETURNED)</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      {isError ? (
        <div className="p-4 bg-red-950/20 text-red-500 border-l-2 border-red-500 text-sm font-sans tracking-wide">
          <span className="font-bold">خطأ:</span> {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="border border-white/10 bg-transparent flex flex-col gap-0 overflow-hidden">
          <InventoryTable 
            items={inventoryItems || []} 
            isLoading={isLoading} 
            user={user} 
          />
          
          {/* Simple Pagination */}
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
              disabled={!inventoryItems || inventoryItems.length < limit || isLoading}
              className="px-6 py-2 border border-white/10 text-white hover:bg-white/[0.05] disabled:opacity-50 transition-colors font-sans text-[10px] uppercase tracking-luxury rounded-none"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {user.role === "admin" && (
        <IntakeModal 
          isOpen={isIntakeModalOpen} 
          onClose={() => setIsIntakeModalOpen(false)} 
        />
      )}
    </div>
  );
}
