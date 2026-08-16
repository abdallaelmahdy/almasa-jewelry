"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";

function Field({
  label,
  value,
  suffix,
  select,
  onChange,
}: {
  label: string;
  value: string;
  suffix?: string;
  select?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
}) {
  return (
    <label className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/5 py-3 cursor-pointer">
      <span className="text-xs text-white/45">{label}</span>
      <div className="relative flex items-center gap-2">
        {suffix && <span className="text-[11px] text-gold">{suffix}</span>}
        {select ? (
          <>
            <span className="text-sm font-bold text-white pe-4">{value}</span>
            <ChevronDown className="h-4 w-4 text-white/40 absolute end-0 pointer-events-none" />
            <select
              value={value}
              onChange={onChange as any}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="24">24</option>
              <option value="22">22</option>
              <option value="21">21</option>
              <option value="18">18</option>
            </select>
          </>
        ) : onChange ? (
          <input
            type="number"
            min="0"
            step="0.001"
            value={value}
            onChange={onChange as any}
            className="bg-transparent text-sm font-bold text-white text-left w-20 focus:outline-none"
            dir="ltr"
          />
        ) : (
          <span className="text-sm font-bold text-white">{value}</span>
        )}
      </div>
    </label>
  );
}

export function GoldCalculator({
  karat,
  setKarat,
  weight,
  setWeight,
  manufacturing,
  setManufacturing,
  goldPrice,
  finalPrice,
}: {
  karat: string;
  setKarat: (val: string) => void;
  weight: string;
  setWeight: (val: string) => void;
  manufacturing: string;
  setManufacturing: (val: string) => void;
  goldPrice: string;
  finalPrice: string;
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/5 bg-panel p-5">
      <h2 className="mb-2 text-lg font-bold text-white">حاسبة الذهب</h2>

      <div className="flex flex-col gap-6 lg:flex-row-reverse lg:items-start">
        {/* Ring image */}
        <div className="relative mx-auto aspect-square w-40 shrink-0 overflow-hidden rounded-2xl bg-black lg:w-1/2">
          <Image
            src="/products/gold-band.png"
            alt="خاتم ذهب"
            fill
            sizes="200px"
            className="object-cover opacity-80"
          />
        </div>

        {/* Inputs */}
        <div className="flex-1">
          <Field 
            label="العيار" 
            value={karat} 
            onChange={(e) => setKarat(e.target.value)}
            select 
          />
          <Field 
            label="الوزن (جرام)" 
            value={weight} 
            onChange={(e) => setWeight(e.target.value)}
          />
          <Field 
            label="سعر جرام الذهب" 
            value={goldPrice} 
            suffix="ج.م" 
          />
          <Field 
            label="المصنعية" 
            value={manufacturing} 
            suffix="ج.م"
            onChange={(e) => setManufacturing(e.target.value)}
          />
        </div>
      </div>

      {/* Final price bar */}
      <div className="mt-6 flex items-center justify-between rounded-xl bg-gold px-5 py-4 text-black">
        <span className="text-sm font-bold">السعر النهائي</span>
        <span className="text-2xl font-extrabold">
          {finalPrice} <span className="text-sm font-bold">ج.م</span>
        </span>
      </div>
    </section>
  );
}
