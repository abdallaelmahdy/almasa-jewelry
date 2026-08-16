"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  BarChart2, 
  Archive, 
  Settings,
  Gem
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "الرئيسية", href: "/dashboard", icon: Home },
    { name: "المنتجات", href: "/pos", icon: Package },
    { name: "المبيعات", href: "/sales", icon: ShoppingCart },
    { name: "العملاء", href: "/customers", icon: Users },
    { name: "الفواتير", href: "/invoices", icon: FileText },
    { name: "التقارير", href: "/reports", icon: BarChart2 },
    { name: "المخزون", href: "/inventory", icon: Archive },
    { name: "إعدادات", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-l border-white/5 bg-[#0A0A0A] md:flex text-white font-sans" dir="rtl">
      
      {/* Sidebar Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0 border border-white/10 bg-white/5 flex items-center justify-center">
           <Gem className="h-5 w-5 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        <span className="text-lg font-bold text-[#D4AF37]">محل الماسة</span>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-1 px-4 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href === "/pos" && pathname.includes("/pos"));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
    </aside>
  );
}
