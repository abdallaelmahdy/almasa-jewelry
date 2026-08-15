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
    <header className="flex h-[72px] shrink-0 items-center gap-x-4 border-b border-[#262626] bg-[#0a0a0a] px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 z-30">
      {/* Mobile menu button */}
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-gray-400 hover:text-white md:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <span className="sr-only">فتح القائمة</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        <div className="flex flex-1">
          {/* Breadcrumbs or page title could go here later */}
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button 
            type="button" 
            className="-m-2.5 p-2.5 text-gray-400 hover:text-white relative"
          >
            <span className="sr-only">الإشعارات</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-[#c5a059] ring-2 ring-[#0a0a0a]" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-[#262626]" aria-hidden="true" />

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-[#c5a059] transition-colors duration-200"
          >
            تسجيل الخروج
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#0a0a0a] border-l border-[#262626] shadow-2xl overflow-y-auto transform transition-transform duration-300">
            <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-[#262626]">
              <Link href="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
                <Diamond className="w-6 h-6 text-[#c5a059]" />
                <span className="text-lg font-bold text-white">ألماسة</span>
              </Link>
              <button
                type="button"
                className="text-gray-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">إغلاق القائمة</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 px-3 py-4">
              {filteredNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group flex items-center px-3 py-3 text-base font-medium rounded-md",
                      isActive
                        ? "bg-[#141414] text-white border border-[#262626]"
                        : "text-gray-400 hover:bg-[#141414] hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "me-4 h-5 w-5 shrink-0",
                        isActive ? "text-[#c5a059]" : "text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {user && (
              <div className="p-4 border-t border-[#262626] bg-[#0d0d0d]">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-white">{user.username}</span>
                  <span className="text-xs text-gray-400">{user.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
