"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Search } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">إدارة العملاء</h2>
          <p className="text-muted-foreground mt-1">
            إضافة وتعديل بيانات العملاء وسجل التواصل.
          </p>
        </div>
        
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          إضافة عميل جديد
        </Button>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      {/* Table Area */}
      {isError ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-center">
          حدث خطأ أثناء جلب البيانات: {(error as any)?.response?.data?.detail || error.message}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <CustomerTable 
            customers={customers || []} 
            isLoading={isLoading} 
            onEdit={handleEdit}
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
              disabled={!customers || customers.length < limit || isLoading}
            >
              التالي
            </Button>
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
