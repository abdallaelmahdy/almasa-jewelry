import { Printer } from "lucide-react"

const columns = ["الصنف", "الوزن", "الكمية", "الجرام", "المصنعية", "الإجمالي"]

const rows = [
  { name: "خاتم ذهب", weight: "3,305", qty: "1", gram: "2,305", craft: "100", total: "8,157.50" },
  { name: "سلسال ذهب", weight: "5.2", qty: "1", gram: "5.2", craft: "150", total: "12,286.00" },
]

const summary = [
  { label: "المجموع الفرعي", value: "20,443.50", suffix: "ج.م" },
  { label: "المصنعية", value: "250.00", suffix: "ج.م" },
]

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-white/40">{label}</span>
      <span className="text-sm text-white/85">{value}</span>
    </div>
  )
}

export function InvoicePanel() {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-white/5 bg-panel p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">فاتورة رقم #1001</h2>
        <button className="flex items-center gap-2 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-gold-soft">
          <Printer className="h-3.5 w-3.5" />
          <span>طباعة</span>
        </button>
      </div>

      {/* Customer details */}
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-b border-white/5 pb-5">
        <Detail label="اسم العميل" value="01012345678" />
        <Detail label="رقم الهاتف" value="رقم الهاتف" />
        <Detail label="التاريخ" value="2024-05-15" />
        <Detail label="المنتجات" value="المنتجات" />
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-white/5">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-white/5 text-white/45">
              {columns.map((col) => (
                <th key={col} className="px-3 py-2.5 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-white/5">
                <td className="px-3 py-3 font-bold text-gold">{row.name}</td>
                <td className="px-3 py-3 text-white/70">{row.weight}</td>
                <td className="px-3 py-3 text-white/70">{row.qty}</td>
                <td className="px-3 py-3 text-white/70">{row.gram}</td>
                <td className="px-3 py-3 text-white/70">{row.craft}</td>
                <td className="px-3 py-3 font-bold text-white">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial summary */}
      <div className="mt-auto flex flex-col gap-3 pt-6">
        {summary.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-white/45">{item.label}</span>
            <span className="text-white/85">
              {item.value} <span className="text-xs text-white/50">{item.suffix}</span>
            </span>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-gold/30 pt-4">
          <span className="text-sm font-bold text-gold">الإجمالي</span>
          <span className="text-xl font-extrabold text-gold">
            20,693.50 <span className="text-sm font-bold">ج.م</span>
          </span>
        </div>
      </div>
    </section>
  )
}
