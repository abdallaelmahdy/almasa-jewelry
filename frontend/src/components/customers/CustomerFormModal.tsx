"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateCustomer, useUpdateCustomer, useCustomer } from "@/hooks/useCustomers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, UserPlus, Save, X } from "lucide-react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";

const customerSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب"),
  phone: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CustomerFormModal({
  isOpen,
  onClose,
  editingId,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingId: number | null;
}) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: currentCustomer, isLoading: isLoadingCurrent } = useCustomer(editingId);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const isEditing = !!editingId;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (isEditing && currentCustomer) {
        form.reset({
          name: currentCustomer.name,
          phone: currentCustomer.phone || "",
          email: currentCustomer.email || "",
          notes: currentCustomer.notes || "",
        });
      } else if (!isEditing) {
        form.reset({ name: "", phone: "", email: "", notes: "" });
      }
    }
  }, [isOpen, isEditing, currentCustomer, form]);

  const onSubmit = async (values: CustomerFormValues) => {
    setErrorMsg(null);
    try {
      if (isEditing && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: {
            name: values.name,
            phone: values.phone || null,
            email: values.email || null,
            notes: values.notes || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          phone: values.phone || null,
          email: values.email || null,
          notes: values.notes || null,
        });
      }
      onClose();
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setErrorMsg("رقم الهاتف مسجل مسبقاً لعميل آخر");
      } else {
        setErrorMsg(err?.response?.data?.detail || "حدث خطأ أثناء حفظ البيانات");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border border-[#262626] p-0 overflow-hidden shadow-2xl" dir="rtl">
        <div className="bg-[#141414] border-b border-[#262626] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#141414] p-2 rounded-lg border border-[#c5a059]/30 text-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.1)]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                {isEditing ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-1">
                {isEditing ? "قم بتحديث بيانات العميل في النظام." : "أدخل بيانات العميل الجديد لإضافته للنظام."}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isEditing && isLoadingCurrent ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#c5a059]" />
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">اسم العميل <span className="text-[#c5a059]">*</span></label>
                <input 
                  placeholder="الاسم الكامل للعميل" 
                  {...form.register("name")} 
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all"
                />
                {form.formState.errors.name && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">رقم الهاتف</label>
                <input 
                  placeholder="مثال: 0501234567" 
                  {...form.register("phone")} 
                  dir="ltr" 
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all font-mono text-left"
                />
                {form.formState.errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.phone.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">البريد الإلكتروني</label>
                <input 
                  placeholder="email@example.com" 
                  {...form.register("email")} 
                  dir="ltr" 
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all font-mono text-left"
                />
                {form.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message as string}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-300">ملاحظات</label>
                <textarea 
                  placeholder="ملاحظات إضافية عن العميل (اختياري)" 
                  {...form.register("notes")} 
                  rows={3}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]/50 focus:ring-1 focus:ring-[#c5a059]/50 transition-all resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-xl text-center">
                  {errorMsg}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]">
                <button 
                  type="button" 
                  onClick={onClose} 
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl border border-[#262626] text-gray-400 hover:text-white hover:bg-[#262626] transition-colors"
                >
                  إلغاء
                </button>
                <LuxuryButton type="submit" disabled={isPending} className="px-8">
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 me-2" />
                      حفظ
                    </>
                  )}
                </LuxuryButton>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
