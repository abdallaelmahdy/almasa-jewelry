"use client";

import { format, parseISO } from "date-fns";


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
    <div className="flex items-center gap-2 bg-[#141414] border border-[#262626] p-2 rounded-none shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 ms-2 font-medium">من</span>
        <input 
          type="date" 
          value={format(value.from, "yyyy-MM-dd")}
          onChange={handleFromChange}
          className="w-auto bg-[#0a0a0a] border border-[#262626] rounded-md px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors"
          dir="ltr"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 font-medium">إلى</span>
        <input 
          type="date" 
          value={format(value.to, "yyyy-MM-dd")}
          onChange={handleToChange}
          className="w-auto bg-[#0a0a0a] border border-[#262626] rounded-md px-3 py-1.5 text-white font-mono text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors"
          dir="ltr"
        />
      </div>
    </div>
  );
}
