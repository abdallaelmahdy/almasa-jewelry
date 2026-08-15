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
    <div className="hidden md:flex flex-col w-64 bg-background border-l border-white/5 h-full text-white z-40 relative">
      <div className="flex h-20 items-center justify-center px-4 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <Diamond className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-700" />
          <div className="flex flex-col items-start">
            <span className="font-display text-xl text-white leading-none">الماسة</span>
            <span className="font-sans text-[8px] uppercase tracking-luxury text-primary leading-none mt-1.5">للمجوهرات</span>
          </div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-8">
        <nav className="space-y-1 px-4">
          <span className="font-sans text-[9px] uppercase tracking-luxury-wide text-muted-foreground px-3 mb-4 block">القائمة الرئيسية</span>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-3 text-xs font-sans rounded-none transition-colors duration-500 relative",
                  isActive
                    ? "bg-white/[0.03] text-white"
                    : "text-white/60 hover:bg-white/[0.02] hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-primary" />
                )}
                <item.icon
                  className={cn(
                    "me-4 flex-shrink-0 h-4 w-4 transition-colors duration-500",
                    isActive ? "text-primary" : "text-white/40 group-hover:text-primary/70"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-white/5 bg-secondary/10">
        <div className="flex flex-col gap-1.5 px-3 py-2">
          <span className="font-sans text-xs font-bold text-white truncate">{user.username}</span>
          <span className="font-numeric text-[10px] text-muted-foreground tracking-wider truncate">{user.email}</span>
          <div className="mt-2 flex">
            <span className="font-sans text-[9px] uppercase tracking-luxury font-medium text-background bg-primary px-2 py-0.5">
              {user.role === "admin" ? "مدير النظام" : "موظف مبيعات"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
