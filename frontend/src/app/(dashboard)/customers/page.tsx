"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { UserPlus, Search, Users } from "lucide-react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

export default function CustomersPage() {
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Handle simple debounce for search to avoid excessive API calls
  // In a production app you'd use a robust debounce hook, but this works for basic UI response
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    // basic debounce
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
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#141414] p-4 rounded-xl border border-[#c5a059]/30 text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.1)]">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">إدارة العملاء</h2>
            <p className="text-gray-400 mt-2">
              إضافة وتعديل بيانات العملاء وسجل التواصل.
            </p>
          </div>
        </div>
        
        <LuxuryButton onClick={handleAddNew} className="flex items-center gap-2 px-6">
          <UserPlus className="w-5 h-5" />
          إضافة عميل جديد
        </LuxuryButton>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 rounded-xl border border-[#262626] bg-[#0a0a0a] shadow-lg">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-3.5 h-5 w-5 text-gray-500 group-focus-within:text-[#c5a059] transition-colors" />
          <input
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all font-mono"
            dir="ltr"
          />
        </div>
      </div>

      {/* Table Area */}
      {isError ? (
        <div className="p-6 rounded-xl bg-red-950/50 text-red-400 border border-red-900/50 text-center shadow-lg">
          <span className="font-bold">حدث خطأ أثناء جلب البيانات:</span> {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <CustomerTable 
            customers={customers || []} 
            isLoading={isLoading} 
            onEdit={handleEdit}
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
              disabled={!customers || customers.length < limit || isLoading}
              className="px-4 py-2 border border-[#262626] rounded-md text-white hover:bg-[#262626] disabled:opacity-50 transition-colors"
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
