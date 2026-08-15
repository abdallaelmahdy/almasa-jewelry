"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { UserPlus, Search, Users } from "lucide-react";

export default function CustomersPage() {
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Handle simple debounce for search to avoid excessive API calls
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 500);
  };

  const queryFilters = {
    skip: (page - 1) * limit,
    limit,
    ...(debouncedSearch && { q: debouncedSearch }),
  };

  const { data: customers, isLoading, isError, error } = useCustomers(queryFilters);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setIsModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-6 border-b border-white/5 gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl md:text-4xl text-white">العملاء</h2>
          <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide">
            ALMASA CLIENT DIRECTORY
          </p>
        </div>
        
        <button 
          onClick={handleAddNew} 
          className="flex items-center gap-2 px-6 h-12 bg-primary text-[#080808] hover:bg-primary/90 font-sans text-[10px] uppercase tracking-luxury font-bold transition-all duration-500 rounded-none"
        >
          <UserPlus className="w-4 h-4" />
          إضافة عميل جديد
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex gap-0 border border-white/10">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-3.5 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <input
            placeholder="البحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-full bg-white/[0.01] border-none py-3 px-10 text-white placeholder-white/30 focus:outline-none focus:bg-white/[0.03] transition-all font-sans text-xs tracking-wide rounded-none"
            dir="ltr"
          />
        </div>
      </div>

      {/* Table Area */}
      {isError ? (
        <div className="p-4 bg-red-950/20 text-red-500 border-l-2 border-red-500 text-sm font-sans tracking-wide">
          <span className="font-bold">خطأ:</span> {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="border border-white/10 bg-transparent flex flex-col gap-0 overflow-hidden">
          <CustomerTable 
            customers={customers || []} 
            isLoading={isLoading} 
            onEdit={handleEdit}
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
              disabled={!customers || customers.length < limit || isLoading}
              className="px-6 py-2 border border-white/10 text-white hover:bg-white/[0.05] disabled:opacity-50 transition-colors font-sans text-[10px] uppercase tracking-luxury rounded-none"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingId={editingId}
      />
    </div>
  );
}
