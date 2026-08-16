"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POSCustomerSelector } from "@/components/pos/POSCustomerSelector";

export function CustomerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] bg-[#111111] border border-[#D4AF37]/20 text-white rounded-xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white mb-2">تحديد العميل</DialogTitle>
        </DialogHeader>
        
        <div className="pt-2">
          <POSCustomerSelector />
        </div>
      </DialogContent>
    </Dialog>
  );
}
