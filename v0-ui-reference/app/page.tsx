import { Search } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { CategoryTabs } from "@/components/category-tabs"
import { ProductGrid } from "@/components/product-grid"
import { GoldCalculator } from "@/components/gold-calculator"
import { InvoicePanel } from "@/components/invoice-panel"

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Topbar />

        <main className="flex-1 px-5 py-5">
          <h1 className="mb-5 text-2xl font-bold text-white">نقطة البيع</h1>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch">
            {/* Column 1 — Products (40%) */}
            <div className="flex flex-col xl:w-2/5">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  className="w-full rounded-lg border border-white/10 bg-[#151515] py-2.5 pr-10 pl-4 text-sm text-white/80 placeholder:text-white/40 focus:border-gold/50 focus:outline-none"
                />
              </div>

              <div className="mt-5">
                <CategoryTabs />
              </div>

              <div className="mt-5">
                <ProductGrid />
              </div>
            </div>

            {/* Column 2 — Gold Calculator (30%) */}
            <div className="xl:w-[30%]">
              <GoldCalculator />
            </div>

            {/* Column 3 — Invoice (30%) */}
            <div className="xl:w-[30%]">
              <InvoicePanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
