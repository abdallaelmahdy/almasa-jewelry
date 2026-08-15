import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Diamond } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#c5a059] bg-[#0d0d0d] text-white backdrop-blur supports-[backdrop-filter]:bg-[#0d0d0d]/90">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3">
            <Diamond className="h-8 w-8 text-[#c5a059]" />
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none text-white">محل الماسة</span>
              <span className="text-xs text-[#c5a059] font-medium mt-1">للمجوهرات</span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-8">
          <Link href="/" className="text-sm font-medium text-[#c5a059] hover:text-[#c5a059]/80 transition-colors">الرئيسية</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" className="border-[#c5a059]/50 text-[#c5a059] hover:bg-[#c5a059] hover:text-[#0d0d0d] font-semibold">
              تسجيل الدخول
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
