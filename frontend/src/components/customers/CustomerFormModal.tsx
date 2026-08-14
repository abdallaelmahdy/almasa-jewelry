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
import { Loader2 } from "lucide-react";

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
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "قم بتحديث بيانات العميل أدناه." : "أدخل تفاصيل العميل الجديد."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingCurrent ? (
          <div className="flex justify-center p-6">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4 mt-4">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم العميل *</FormLabel>
                    <FormControl>
                      <Input placeholder="الاسم الكامل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: 0501234567" {...field} dir="ltr" className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} dir="ltr" className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Input placeholder="ملاحظات إضافية عن العميل" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive text-destructive-foreground text-sm rounded-md">
                  {errorMsg}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  حفظ
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
