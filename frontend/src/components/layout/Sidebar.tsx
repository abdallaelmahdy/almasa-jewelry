"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  PackageSearch, 
  Users, 
  History, 
  BarChart3, 
  ShieldCheck,
  Diamond
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navigation = [
    { name: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "employee"] },
    { name: "نقطة البيع (POS)", href: "/pos", icon: ShoppingCart, roles: ["admin", "employee"] },
    { name: "المخزون", href: "/inventory", icon: PackageSearch, roles: ["admin", "employee"] },
    { name: "العملاء", href: "/customers", icon: Users, roles: ["admin", "employee"] },
    { name: "المبيعات", href: "/sales", icon: History, roles: ["admin", "employee"] },
    { name: "التقارير", href: "/reports", icon: BarChart3, roles: ["admin"] },
    { name: "سجل التدقيق", href: "/audit", icon: ShieldCheck, roles: ["admin"] },
  ];

  if (!user) return null;

  const filteredNav = navigation.filter((item) => item.roles.includes(user.role));

  return (
    <div className="hidden md:flex flex-col w-64 bg-[#0a0a0a] border-l border-[#262626] h-full text-white shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-40 relative">
      <div className="flex h-[72px] items-center justify-center px-4 border-b border-[#262626]">
        <Link href="/" className="flex items-center gap-2 group">
          <Diamond className="w-7 h-7 text-[#c5a059] group-hover:scale-110 transition-transform duration-500" />
          <div className="flex flex-col items-start">
            <span className="text-xl font-bold tracking-tight text-white leading-none">ألماسة</span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#c5a059] leading-none mt-1">للمجوهرات</span>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-3">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-[#141414] text-white shadow-sm border border-[#262626]"
                    : "text-gray-400 hover:bg-[#141414] hover:text-white border border-transparent"
                )}
              >
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#c5a059] rounded-r-md shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                )}
                <item.icon
                  className={cn(
                    "me-3 flex-shrink-0 h-5 w-5 transition-colors duration-300",
                    isActive ? "text-[#c5a059]" : "text-gray-500 group-hover:text-[#c5a059]"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-[#262626] bg-[#0d0d0d]">
        <div className="flex flex-col gap-1 px-2 py-1">
          <span className="text-sm font-bold text-white truncate">{user.username}</span>
          <span className="text-xs text-gray-400 truncate">{user.email}</span>
          <div className="mt-2 flex">
            <span className="text-[10px] font-medium text-[#0d0d0d] bg-[#c5a059] px-2.5 py-0.5 rounded-sm tracking-wide">
              {user.role === "admin" ? "مدير النظام" : "موظف مبيعات"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
