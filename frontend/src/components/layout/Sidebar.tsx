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
    { name: "لوحة القيادة", href: "/", icon: LayoutDashboard, roles: ["admin", "employee"] },
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
    <div className="hidden md:flex flex-col w-64 bg-sidebar border-l border-sidebar-border h-full text-sidebar-foreground">
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border bg-sidebar-primary/5">
        <Diamond className="w-6 h-6 text-sidebar-primary me-2" />
        <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">ألماسة للمجوهرات</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "me-3 flex-shrink-0 h-5 w-5 transition-colors",
                    isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border bg-sidebar-primary/5">
        <div className="flex flex-col">
          <span className="text-sm font-bold truncate">{user.username}</span>
          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          <span className="mt-1 text-xs font-medium text-sidebar-primary bg-sidebar-primary/10 px-2 py-0.5 rounded-full w-fit">
            {user.role === "admin" ? "مدير النظام" : "موظف مبيعات"}
          </span>
        </div>
      </div>
    </div>
  );
}
