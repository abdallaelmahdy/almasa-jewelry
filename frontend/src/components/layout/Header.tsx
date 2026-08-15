"use client";

import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { useState } from "react";
import { LogOut, Menu, Bell, X, LayoutDashboard, ShoppingCart, PackageSearch, Users, History, BarChart3, ShieldCheck, Diamond } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "employee"] },
    { name: "نقطة البيع (POS)", href: "/pos", icon: ShoppingCart, roles: ["admin", "employee"] },
    { name: "المخزون", href: "/inventory", icon: PackageSearch, roles: ["admin", "employee"] },
    { name: "العملاء", href: "/customers", icon: Users, roles: ["admin", "employee"] },
    { name: "المبيعات", href: "/sales", icon: History, roles: ["admin", "employee"] },
    { name: "التقارير", href: "/reports", icon: BarChart3, roles: ["admin"] },
    { name: "سجل التدقيق", href: "/audit", icon: ShieldCheck, roles: ["admin"] },
  ];

  const filteredNav = user ? navigation.filter((item) => item.roles.includes(user.role)) : [];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <header className="flex h-20 shrink-0 items-center gap-x-4 border-b border-white/5 bg-background px-4 sm:gap-x-6 sm:px-6 lg:px-8 z-30">
      {/* Mobile menu button */}
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-white/50 hover:text-white md:hidden transition-colors"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <span className="sr-only">فتح القائمة</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        <div className="flex flex-1 items-center">
          <span className="hidden md:block font-sans text-[10px] uppercase tracking-luxury text-muted-foreground">
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button 
            type="button" 
            className="-m-2.5 p-2.5 text-white/50 hover:text-white relative transition-colors"
          >
            <span className="sr-only">الإشعارات</span>
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute top-2.5 right-3 block h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-luxury font-medium text-white/50 hover:text-primary transition-colors duration-500"
          >
            تسجيل الخروج
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-[#080808]/90 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-background border-l border-white/5 shadow-2xl overflow-y-auto transform transition-transform duration-500">
            <div className="flex h-20 shrink-0 items-center justify-between px-6 border-b border-white/5">
              <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
                <Diamond className="w-5 h-5 text-primary" />
                <span className="font-display text-xl text-white">الماسة</span>
              </Link>
              <button
                type="button"
                className="text-white/50 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">إغلاق القائمة</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2 px-4 py-8">
              <span className="font-sans text-[9px] uppercase tracking-luxury-wide text-muted-foreground px-3 mb-6 block">القائمة الرئيسية</span>
              {filteredNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group flex items-center px-4 py-4 font-sans text-xs transition-colors duration-500 relative",
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
                        "me-4 h-4 w-4 shrink-0 transition-colors duration-500",
                        isActive ? "text-primary" : "text-white/40"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {user && (
              <div className="p-6 border-t border-white/5 bg-secondary/10">
                <div className="flex flex-col gap-1.5">
                  <span className="font-sans text-xs font-bold text-white">{user.username}</span>
                  <span className="font-numeric text-[10px] text-muted-foreground tracking-wider">{user.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
