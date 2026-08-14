"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { SaleOut } from "@/types/sales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Loader2 } from "lucide-react";

export function SalesTable({
  sales,
  isLoading,
  onView,
}: {
  sales: SaleOut[];
  isLoading: boolean;
  onView: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        جاري تحميل المبيعات...
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لا توجد مبيعات مسجلة.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-right">رقم الفاتورة</TableHead>
            <TableHead className="text-right">تاريخ العملية</TableHead>
            <TableHead className="text-right">العميل</TableHead>
            <TableHead className="text-right">المبلغ الإجمالي</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-center">التفاصيل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id} className={sale.status === "REFUNDED" ? "bg-destructive/5 hover:bg-destructive/10" : ""}>
              <TableCell className="font-mono font-medium">
                {sale.invoice?.invoice_number || `SALE-${sale.id}`}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(sale.created_at), "dd MMM yyyy - hh:mm a", { locale: ar })}
              </TableCell>
              <TableCell>
                {sale.customer_id ? `رقم ${sale.customer_id}` : <span className="text-muted-foreground">عميل نقدي</span>}
              </TableCell>
              <TableCell className="font-mono font-bold">
                {sale.total_amount} د.إ
              </TableCell>
              <TableCell>
                {sale.status === "COMPLETED" ? (
                  <Badge className="bg-green-600 hover:bg-green-700">مكتملة</Badge>
                ) : sale.status === "REFUNDED" ? (
                  <Badge variant="destructive">مسترجعة</Badge>
                ) : (
                  <Badge variant="secondary">{sale.status}</Badge>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => onView(sale.id)}
                >
                  <Eye className="w-4 h-4 me-1" />
                  عرض الفاتورة
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
