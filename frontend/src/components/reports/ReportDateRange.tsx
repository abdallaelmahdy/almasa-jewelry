"use client";

import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";

interface DateRange {
  from: Date;
  to: Date;
}

export function ReportDateRange({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange({ ...value, from: parseISO(e.target.value) });
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange({ ...value, to: parseISO(e.target.value) });
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground ms-2">من</span>
        <Input 
          type="date" 
          value={format(value.from, "yyyy-MM-dd")}
          onChange={handleFromChange}
          className="w-auto"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">إلى</span>
        <Input 
          type="date" 
          value={format(value.to, "yyyy-MM-dd")}
          onChange={handleToChange}
          className="w-auto"
        />
      </div>
    </div>
  );
}
