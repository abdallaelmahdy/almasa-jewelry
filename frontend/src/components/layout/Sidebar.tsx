"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gem, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { navForRole } from "@/components/layout/nav";

export function Sidebar({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "drawer";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.user?.role);
  const navigation = navForRole(role);

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-e border-white/5 bg-[#0A0A0A] text-white font-sans",
        variant === "desktop" && "hidden md:flex",
        variant === "drawer" && "fixed inset-y-0 start-0 z-50 md:hidden shadow-2xl"
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-3 px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-white/10 bg-white/5 flex items-center justify-center">
            <Gem className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-bold text-[#D4AF37]">محل الماسة</span>
        </div>
        {variant === "drawer" && (
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={onNavigate}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
