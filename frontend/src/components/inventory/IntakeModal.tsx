"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useCreateInventory } from "@/hooks/useInventory";
import { ProductOut } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, PackagePlus, Save } from "lucide-react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

const intakeSchema = z.object({
  product_id: z.coerce.number().min(1, "اختر المنتج"),
  karat: z.coerce.number().min(18, "العيار غير صالح"),
  weight: z.string().min(1, "الوزن مطلوب"),
  cost_basis: z.string().min(1, "التكلفة مطلوبة"),
  manufacturing_fee: z.string().min(1, "أجرة المصنعية مطلوبة"),
});

export function IntakeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const createMutation = useCreateInventory();

  const form = useForm<z.infer<typeof intakeSchema>>({
    resolver: zodResolver(intakeSchema) as any,
    defaultValues: {
      product_id: 0,
      karat: 21,
      weight: "",
      cost_basis: "0.00",
      manufacturing_fee: "0.00",
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch products when modal opens
      setIsLoadingProducts(true);
      api.get<{items: ProductOut[]}>("/catalog/products?limit=100")
        .then(res => {
          // Check if response is paginated (items array) or direct array
          const productList = Array.isArray(res.data) ? res.data : res.data.items || [];
          setProducts(productList);
        })
        .catch(err => console.error("Error fetching products", err))
        .finally(() => setIsLoadingProducts(false));
    } else {
      form.reset();
      setErrorMsg(null);
    }
  }, [isOpen, form]);

  const onSubmit = async (values: z.infer<typeof intakeSchema>) => {
    setErrorMsg(null);
    try {
      await createMutation.mutateAsync({
        product_id: values.product_id,
        karat: values.karat,
        weight: values.weight,
        cost_basis: values.cost_basis,
        manufacturing_fee: values.manufacturing_fee,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "حدث خطأ أثناء إضافة القطعة");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border border-[#262626] p-0 overflow-hidden shadow-2xl" dir="rtl">
        <div className="bg-[#141414] border-b border-[#262626] p-6 flex items-center gap-3">
          <div className="bg-[#141414] p-2 rounded-lg border border-[#c5a059]/30 text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.1)]">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-white">إضافة مخزون جديد</DialogTitle>
            <DialogDescription className="text-gray-400 mt-1">
              قم بإدخال تفاصيل القطعة الجديدة لإضافتها إلى المخزون المتاح.
            </DialogDescription>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">المنتج <span className="text-[#c5a059]">*</span></label>
              <select
                {...form.register("product_id")}
                className="w-full bg-[#141414] border border-[#262626] rounded-none py-3 px-4 text-white focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all appearance-none"
                disabled={isLoadingProducts}
              >
                <option value="0" disabled>{isLoadingProducts ? "جاري تحميل المنتجات..." : "اختر المنتج"}</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.product_id && (
                <p className="text-red-400 text-xs mt-1">{form.formState.errors.product_id.message as string}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">العيار <span className="text-[#c5a059]">*</span></label>
                <select
                  {...form.register("karat")}
                  className="w-full bg-[#141414] border border-[#262626] rounded-none py-3 px-4 text-white focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all appearance-none"
                >
                  <option value="18">18 قيراط</option>
                  <option value="21">21 قيراط</option>
                  <option value="22">22 قيراط</option>
                  <option value="24">24 قيراط</option>
                </select>
                {form.formState.errors.karat && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.karat.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">الوزن (جم) <span className="text-[#c5a059]">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="مثال: 12.5"
                  {...form.register("weight")}
                  dir="ltr"
                  className="w-full bg-[#141414] border border-[#262626] rounded-none py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all text-left font-mono"
                />
                {form.formState.errors.weight && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.weight.message as string}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">التكلفة الأساسية <span className="text-[#c5a059]">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("cost_basis")}
                  dir="ltr"
                  className="w-full bg-[#141414] border border-[#262626] rounded-none py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all text-left font-mono"
                />
                {form.formState.errors.cost_basis && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.cost_basis.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">أجرة المصنعية <span className="text-[#c5a059]">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("manufacturing_fee")}
                  dir="ltr"
                  className="w-full bg-[#141414] border border-[#262626] rounded-none py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all text-left font-mono"
                />
                {form.formState.errors.manufacturing_fee && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.manufacturing_fee.message as string}</p>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-none text-center">
                {errorMsg}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={createMutation.isPending}
                className="px-6 py-2.5 rounded-none border border-[#262626] text-gray-400 hover:text-white hover:bg-[#262626] transition-colors"
              >
                إلغاء
              </button>
              <LuxuryButton type="submit" disabled={createMutation.isPending} className="px-8">
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 me-2" />
                    حفظ وإضافة
                  </>
                )}
              </LuxuryButton>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
