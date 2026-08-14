"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useCreateInventory } from "@/hooks/useInventory";
import { InventoryItemCreate, ProductOut } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مخزون جديد</DialogTitle>
          <DialogDescription>
            قم بإدخال تفاصيل القطعة الجديدة لإضافتها إلى المخزون.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 mt-4">
            <FormField
              control={form.control as any}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنتج</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingProducts ? "جاري تحميل المنتجات..." : "اختر المنتج"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name} ({p.sku_prefix})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="karat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العيار</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العيار" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="18">18 قيراط</SelectItem>
                        <SelectItem value="21">21 قيراط</SelectItem>
                        <SelectItem value="22">22 قيراط</SelectItem>
                        <SelectItem value="24">24 قيراط</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوزن (جم)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 12.5" {...field} dir="ltr" className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="cost_basis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التكلفة الأساسية</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} dir="ltr" className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as any}
                name="manufacturing_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أجرة المصنعية</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" {...field} dir="ltr" className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive-foreground text-sm rounded-md">
                {errorMsg}
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                حفظ وإضافة
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
