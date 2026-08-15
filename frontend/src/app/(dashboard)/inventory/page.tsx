"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useInventory } from "@/hooks/useInventory";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { IntakeModal } from "@/components/inventory/IntakeModal";
import { PackagePlus, Search, PackageOpen } from "lucide-react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

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
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#141414] p-4 rounded-xl border border-[#c5a059]/30 text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)]">
            <PackageOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">إدارة المخزون</h2>
            <p className="text-gray-400 mt-2">
              عرض وتتبع حالة القطع، قفل وفتح المخزون للبيع.
            </p>
          </div>
        </div>
        
        {user.role === "admin" && (
          <LuxuryButton onClick={() => setIsIntakeModalOpen(true)} className="flex items-center gap-2 px-6">
            <PackagePlus className="w-5 h-5" />
            إضافة مخزون جديد
          </LuxuryButton>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 rounded-xl border border-[#262626] bg-[#0a0a0a] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-[#c5a059] transition-colors" />
          <input
            placeholder="بحث برقم القطعة (SKU)..."
            value={skuFilter}
            onChange={(e) => {
              setSkuFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all font-mono"
            dir="ltr"
          />
        </div>
        
        <div className="w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value || "all");
              setPage(1);
            }}
            className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#c5a059]/50 transition-colors appearance-none"
          >
            <option value="all">جميع الحالات</option>
            <option value="AVAILABLE">متاح (AVAILABLE)</option>
            <option value="LOCKED">مقفول (LOCKED)</option>
            <option value="SOLD">مباع (SOLD)</option>
            <option value="RETURNED">مسترجع (RETURNED)</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      {isError ? (
        <div className="p-6 rounded-xl bg-red-950/50 text-red-400 border border-red-900/50 text-center shadow-lg">
          <span className="font-bold">حدث خطأ أثناء جلب البيانات:</span> {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <InventoryTable 
            items={inventoryItems || []} 
            isLoading={isLoading} 
            user={user} 
          />
          
          {/* Simple Pagination */}
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
              disabled={!inventoryItems || inventoryItems.length < limit || isLoading}
              className="px-4 py-2 border border-[#262626] rounded-md text-white hover:bg-[#262626] disabled:opacity-50 transition-colors"
            >
              التالي
            </button>
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
