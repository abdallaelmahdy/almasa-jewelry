"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CustomerOut } from "@/types/customer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Loader2 } from "lucide-react";

export function CustomerTable({
  customers,
  isLoading,
  onEdit,
}: {
  customers: CustomerOut[];
  isLoading: boolean;
  onEdit: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        جاري تحميل العملاء...
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لا يوجد عملاء مطابقين للبحث.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">رقم الهاتف</TableHead>
            <TableHead className="text-right">البريد الإلكتروني</TableHead>
            <TableHead className="text-right">ملاحظات</TableHead>
            <TableHead className="text-right">تاريخ الإضافة</TableHead>
            <TableHead className="text-center">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-bold text-foreground">{customer.name}</TableCell>
              <TableCell dir="ltr" className="text-right font-mono">{customer.phone || "-"}</TableCell>
              <TableCell className="text-muted-foreground">{customer.email || "-"}</TableCell>
              <TableCell className="text-muted-foreground max-w-[200px] truncate" title={customer.notes || ""}>
                {customer.notes || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(customer.created_at), "dd MMM yyyy", { locale: ar })}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => onEdit(customer.id)}
                >
                  <Edit2 className="w-4 h-4 me-1" />
                  تعديل
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
