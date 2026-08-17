"use client";

import { useAuthStore } from "@/stores/authStore";
import { Menu, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { PAGE_TITLES, roleLabel } from "@/components/layout/nav";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "لوحة التحكم";

  return (
    <header
      className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/5 bg-[#0A0A0A] px-6 z-30 font-sans"
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="القائمة"
          onClick={onMenuClick}
          className="text-white/60 hover:text-white md:hidden transition-colors"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="font-display text-xl font-medium text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end text-end">
          <span className="text-sm text-white/80">
            مرحباً، {user?.username || "—"}
          </span>
          <span className="text-[10px] text-white/40">{roleLabel(user?.role)}</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#151515]">
          <User className="h-4 w-4 text-[#D4AF37]" />
        </div>
      </div>
    </header>
  );
}
