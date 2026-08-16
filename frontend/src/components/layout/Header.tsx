"use client";

import { useAuthStore } from "@/stores/authStore";
import { Menu, Bell, User } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/5 bg-[#0A0A0A] px-6 z-30 font-sans" dir="rtl">
      
      {/* Right Side (Title / Menu) */}
      <div className="flex items-center gap-4">
        <button 
          type="button"
          aria-label="القائمة" 
          className="text-white/60 hover:text-white md:hidden transition-colors"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        {pathname === "/dashboard" && (
          <h1 className="hidden md:block font-display text-xl font-medium text-white">لوحة التحكم</h1>
        )}
      </div>

      {/* Left Side (Profile / Notifications) */}
      <div className="flex items-center gap-5" dir="ltr">
        
        {/* Notifications */}
        <button 
          type="button" 
          className="text-white/50 hover:text-white relative transition-colors"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#D4AF37]" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm text-white/70">مرحباً، المدير</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#151515]">
            <User className="h-4 w-4 text-[#D4AF37]" />
          </div>
        </div>

      </div>

    </header>
  );
}
