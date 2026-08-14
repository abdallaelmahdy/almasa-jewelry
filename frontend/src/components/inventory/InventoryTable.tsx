"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { InventoryItemOut } from "@/types/inventory";
import { User } from "@/types/auth";
import { useLockInventory, useUnlockInventory } from "@/hooks/useInventory";
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
import { Lock, Unlock, Loader2 } from "lucide-react";

export function InventoryTable({
  items,
  isLoading,
  user,
}: {
  items: InventoryItemOut[];
  isLoading: boolean;
  user: User;
}) {
  const lockMutation = useLockInventory();
  const unlockMutation = useUnlockInventory();

  const [operatingId, setOperatingId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">متاح</Badge>;
      case "LOCKED":
        return <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700 text-white">مقفول</Badge>;
      case "SOLD":
        return <Badge variant="outline" className="text-muted-foreground">مباع</Badge>;
      case "RETURNED":
        return <Badge variant="destructive">مسترجع</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleLock = async (id: string) => {
    setOperatingId(id);
    try {
      await lockMutation.mutateAsync({
        id,
        payload: { reason: "POS_CHECKOUT", reference_type: "MANUAL_LOCK" },
      });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "حدث خطأ أثناء القفل");
    } finally {
      setOperatingId(null);
    }
  };

  const handleUnlock = async (id: string) => {
    setOperatingId(id);
    try {
      await unlockMutation.mutateAsync({
        id,
        payload: { reason: "MANUAL_UNLOCK" },
      });
    } catch (err: any) {
      alert(err?.response?.data?.detail || "حدث خطأ أثناء الفتح (قد لا تملك الصلاحية)");
    } finally {
      setOperatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        جاري تحميل المخزون...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لا توجد قطع مطابقة للبحث.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-right">رقم القطعة (SKU)</TableHead>
            <TableHead className="text-right">المنتج</TableHead>
            <TableHead className="text-right">الوزن</TableHead>
            <TableHead className="text-right">العيار</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">تاريخ الإضافة</TableHead>
            <TableHead className="text-center">إجراءات القفل</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLocked = item.status === "LOCKED";
            const isAvailable = item.status === "AVAILABLE";
            
            // Authorization logic for UI display only (Backend enforces this strictly)
            const canLock = isAvailable;
            const canUnlock = isLocked && (user.role === "admin" || user.id === item.locked_by_id);
            const isOperating = operatingId === item.id;

            return (
              <TableRow key={item.id}>
                <TableCell className="font-mono font-medium">{item.sku}</TableCell>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>{item.weight} جم</TableCell>
                <TableCell>{item.karat}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div>{getStatusBadge(item.status)}</div>
                    {isLocked && item.locked_by_id && (
                      <span className="text-[10px] text-muted-foreground">
                        بواسطة: {item.locked_by_id}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(item.created_at), "dd MMM yyyy", { locale: ar })}
                </TableCell>
                <TableCell className="text-center">
                  {canLock && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 border-yellow-500/20"
                      onClick={() => handleLock(item.id)}
                      disabled={isOperating}
                    >
                      {isOperating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4 me-1" />}
                      قفل
                    </Button>
                  )}
                  {canUnlock && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/20"
                      onClick={() => handleUnlock(item.id)}
                      disabled={isOperating}
                    >
                      {isOperating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4 me-1" />}
                      {user.role === "admin" && user.id !== item.locked_by_id ? "فتح إجباري" : "فتح"}
                    </Button>
                  )}
                  {!canLock && !canUnlock && (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
