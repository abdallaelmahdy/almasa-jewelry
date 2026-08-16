import {
  LayoutGrid,
  Gem,
  ShoppingBag,
  Users,
  FileText,
  BarChart3,
  Package,
  Settings,
} from "lucide-react"

const navItems = [
  { label: "المنتجات", icon: LayoutGrid, active: true },
  { label: "المبيعات", icon: ShoppingBag, active: false },
  { label: "العملاء", icon: Users, active: false },
  { label: "الفواتير", icon: FileText, active: false },
  { label: "التقارير", icon: BarChart3, active: false },
  { label: "المخزون", icon: Package, active: false },
  { label: "إعدادات", icon: Settings, active: false },
]

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-l border-white/5 bg-[#0d0d0d] md:flex">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <Gem className="h-6 w-6 text-gold" strokeWidth={1.5} />
        <span className="text-lg font-bold text-gold">محل الماسة</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                item.active
                  ? "bg-gold/10 text-gold"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
