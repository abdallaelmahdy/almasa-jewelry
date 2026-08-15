import * as React from "react"
import Link from "next/link"

export function LuxuryFooter() {
  return (
    <footer className="bg-[#080808] border-t border-white/5 pt-32 pb-12 text-white">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-8 mb-24">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-8">
            <div className="flex flex-col">
              <span className="font-display text-4xl text-white tracking-wide">الماسة</span>
            </div>
            <p className="font-sans text-sm leading-relaxed text-white/50 max-w-sm font-light">
              نصوغ الأناقة التي تدوم. الماسة للمجوهرات هي وجهتك لاقتناء قطع فريدة تجمع بين أصالة التراث وروعة التصميم المعاصر.
            </p>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
            
            {/* Collections */}
            <div className="space-y-6">
              <h4 className="font-sans text-[10px] uppercase tracking-luxury-wide text-white/40">المجموعات</h4>
              <ul className="space-y-4">
                <li><Link href="/#shop" className="font-sans text-sm text-white/70 hover:text-white transition-colors">الخواتم</Link></li>
                <li><Link href="/#shop" className="font-sans text-sm text-white/70 hover:text-white transition-colors">السلاسل</Link></li>
                <li><Link href="/#shop" className="font-sans text-sm text-white/70 hover:text-white transition-colors">الأساور</Link></li>
                <li><Link href="/#shop" className="font-sans text-sm text-white/70 hover:text-white transition-colors">السبائك</Link></li>
              </ul>
            </div>

            {/* Discover */}
            <div className="space-y-6">
              <h4 className="font-sans text-[10px] uppercase tracking-luxury-wide text-white/40">اكتشف</h4>
              <ul className="space-y-4">
                <li><Link href="/#heritage" className="font-sans text-sm text-white/70 hover:text-white transition-colors">عن الدار</Link></li>
                <li><Link href="/#contact" className="font-sans text-sm text-white/70 hover:text-white transition-colors">تواصل معنا</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-6">
              <h4 className="font-sans text-[10px] uppercase tracking-luxury-wide text-white/40">قانوني</h4>
              <ul className="space-y-4">
                <li><Link href="/login" className="font-sans text-sm text-white/70 hover:text-white transition-colors mt-8 block">بوابة الإدارة</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[10px] uppercase tracking-luxury text-white/40">
            © {new Date().getFullYear()} ALMASA JEWELRY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6 text-xs text-white/40">
            <span className="font-sans text-[10px] uppercase tracking-luxury">CAIRO, EGYPT</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
