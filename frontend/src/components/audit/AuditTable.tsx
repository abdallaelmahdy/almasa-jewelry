"use client";

import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AuditLogOut } from "@/types/audit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AuditTable({
  logs,
  isLoading,
}: {
  logs: AuditLogOut[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        جاري تحميل السجلات...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لا توجد سجلات مطابقة.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-right">التاريخ والوقت</TableHead>
            <TableHead className="text-right">رقم الموظف</TableHead>
            <TableHead className="text-right">نوع الحركة</TableHead>
            <TableHead className="text-right">المرجع (Resource)</TableHead>
            <TableHead className="text-right">القيم الجديدة</TableHead>
            <TableHead className="text-right">IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-muted-foreground text-sm font-mono whitespace-nowrap">
                {format(new Date(log.created_at), "dd MMM yyyy - hh:mm:ss a", { locale: ar })}
              </TableCell>
              <TableCell className="font-bold">
                {log.user_id}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {log.action_type}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {log.resource_id}
              </TableCell>
              <TableCell className="text-xs max-w-xs truncate" title={log.new_values ? JSON.stringify(log.new_values) : ""}>
                {log.new_values ? (
                  <span className="font-mono bg-muted p-1 rounded">
                    {JSON.stringify(log.new_values).substring(0, 50)}
                    {JSON.stringify(log.new_values).length > 50 ? "..." : ""}
                  </span>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground" dir="ltr">
                {log.ip_address || "127.0.0.1"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
