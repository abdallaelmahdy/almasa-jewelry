import Image from "next/image"
import { ChevronDown } from "lucide-react"

function Field({
  label,
  value,
  suffix,
  select,
}: {
  label: string
  value: string
  suffix?: string
  select?: boolean
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/5 py-3">
      <span className="text-xs text-white/45">{label}</span>
      <div className="relative flex items-center gap-2">
        {suffix && <span className="text-[11px] text-gold">{suffix}</span>}
        <span className="text-sm font-bold text-white">{value}</span>
        {select && <ChevronDown className="h-4 w-4 text-white/40" />}
      </div>
    </div>
  )
}

export function GoldCalculator() {
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
            className="object-cover"
          />
        </div>

        {/* Inputs */}
        <div className="flex-1">
          <Field label="العيار" value="21" select />
          <Field label="الوزن (جرام)" value="10" />
          <Field label="سعر جرام الذهب" value="2,305" suffix="ج.م" />
          <Field label="المصنعية" value="150" suffix="150" />
        </div>
      </div>

      {/* Final price bar */}
      <div className="mt-6 flex items-center justify-between rounded-xl bg-gold px-5 py-4 text-black">
        <span className="text-sm font-bold">السعر النهائي</span>
        <span className="text-2xl font-extrabold">
          23,200 <span className="text-sm font-bold">ج.م</span>
        </span>
      </div>
    </section>
  )
}
