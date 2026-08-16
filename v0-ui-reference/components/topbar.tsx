import { Menu, User } from "lucide-react"

export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-[#0d0d0d] px-5 py-3">
      <button
        aria-label="القائمة"
        className="text-white/60 transition-colors hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-white/70">مرحباً، المدير</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-[#151515]">
          <User className="h-4 w-4 text-gold" />
        </div>
      </div>
    </header>
  )
}
