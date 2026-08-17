import type { LucideIcon } from "lucide-react";
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Archive,
  Settings,
  ScrollText,
} from "lucide-react";
import type { User } from "@/types/auth";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const DASHBOARD_NAV: NavItem[] = [
  { name: "الرئيسية", href: "/dashboard", icon: Home },
  { name: "نقطة البيع", href: "/pos", icon: Package },
  { name: "المبيعات", href: "/sales", icon: ShoppingCart },
  { name: "العملاء", href: "/customers", icon: Users },
  { name: "المخزون", href: "/inventory", icon: Archive },
  { name: "التقارير", href: "/reports", icon: BarChart2, adminOnly: true },
  { name: "سجل التدقيق", href: "/audit", icon: ScrollText, adminOnly: true },
  { name: "إعدادات", href: "/settings", icon: Settings, adminOnly: true },
];

export function navForRole(role: User["role"] | undefined): NavItem[] {
  if (role === "admin") return DASHBOARD_NAV;
  return DASHBOARD_NAV.filter((item) => !item.adminOnly);
}

export const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "لوحة التحكم",
  "/pos": "نقطة البيع",
  "/sales": "المبيعات",
  "/customers": "العملاء",
  "/inventory": "المخزون",
  "/reports": "التقارير",
  "/audit": "سجل التدقيق",
  "/settings": "الإعدادات",
};

export function roleLabel(role: User["role"] | undefined): string {
  if (role === "admin") return "المدير";
  if (role === "employee") return "الموظف";
  return "";
}
