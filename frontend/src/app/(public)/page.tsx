"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans" dir="rtl">
      
      {/* HEADER BAR */}
      <header className="w-full flex items-center justify-between px-12 py-4 bg-[#0A0A0A]">
        
        {/* Right Side (Logo) */}
        <div className="w-28 h-28 relative flex-shrink-0">
          <Image 
            src="/images/logo.jpg" 
            alt="محل الماسة للمجوهرات"
            fill
            className="object-contain"
          />
        </div>

        {/* Center (Navigation) */}
        <nav className="flex items-center gap-8 text-white">
          <Link href="/" className="text-[#D4AF37] font-bold">الرئيسية</Link>
          <Link href="#" className="hover:text-[#D4AF37] transition-colors">المجموعات</Link>
          <Link href="#" className="hover:text-[#D4AF37] transition-colors">المجوهرات</Link>
          <Link href="#" className="hover:text-[#D4AF37] transition-colors">عن الماسة</Link>
          <Link href="#" className="hover:text-[#D4AF37] transition-colors">تواصل معنا</Link>
        </nav>

        {/* Left Side (Buttons/Login) */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/70 hover:text-white text-sm">
            دخول الإدارة
          </Link>
          <button className="text-[#D4AF37] hover:text-[#F3E5AB] transition-colors relative">
            <ShoppingCart className="w-6 h-6" />
          </button>
        </div>

      </header>

      {/* HERO SECTION */}
      <section className="flex w-full min-h-[85vh] items-center justify-between px-20 bg-[#0A0A0A]">
        
        {/* Text Side (Right in RTL) */}
        <div className="w-1/2 flex flex-col items-start gap-6">
          <h1 className="font-display text-6xl md:text-8xl text-white font-bold leading-tight">
            أناقة تدوم
          </h1>
          <p className="font-sans text-xl md:text-2xl text-white/80 leading-relaxed">
            أجمل تشكيلات الذهب<br />
            بأعلى جودة وأفضل سعر
          </p>
          <Link href="/dashboard" className="mt-4 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold font-sans text-lg px-12 py-3 rounded-md transition-colors">
            تسوق الآن
          </Link>
        </div>

        {/* Image Side (Left in RTL) */}
        <div className="w-1/2 flex justify-center relative">
          <div className="relative w-[500px] h-[500px]">
            <Image 
              src="/images/ring.jpg" 
              alt="خاتم ذهب" 
              fill
              className="mix-blend-lighten object-contain drop-shadow-[0_0_50px_rgba(212,175,55,0.2)]"
              priority
            />
          </div>
        </div>

      </section>
    </div>
  );
}
