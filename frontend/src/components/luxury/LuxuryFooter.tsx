import * as React from "react"
import Link from "next/link"
import { Diamond, MapPin, Phone, Mail, Link as LinkIcon, Share2 } from "lucide-react"

export function LuxuryFooter() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-border/30 pt-20 pb-10 text-gray-300">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Diamond className="w-8 h-8 text-primary" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-white">الماسة</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary">للمجوهرات</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              نقدم لكم أرقى تشكيلات الذهب والمجوهرات التي تعكس الفخامة والأصالة في كل تفصيلة. خبرة وثقة تمتد لسنوات في صياغة الأناقة.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <LinkIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white tracking-wide">روابط سريعة</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm hover:text-primary transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link href="/#about" className="text-sm hover:text-primary transition-colors">عن الماسة</Link>
              </li>
              <li>
                <Link href="/#categories" className="text-sm hover:text-primary transition-colors">تسوق المجوهرات</Link>
              </li>
              <li>
                <Link href="/login" className="text-sm hover:text-primary transition-colors">بوابة الموظفين</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white tracking-wide">مجموعاتنا</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/#categories" className="text-sm hover:text-primary transition-colors">خواتم وأطقم ذهبية</Link>
              </li>
              <li>
                <Link href="/#categories" className="text-sm hover:text-primary transition-colors">سلاسل ودلايات</Link>
              </li>
              <li>
                <Link href="/#categories" className="text-sm hover:text-primary transition-colors">أساور وغوايش</Link>
              </li>
              <li>
                <Link href="/#categories" className="text-sm hover:text-primary transition-colors">سبائك وجنيهات</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-white tracking-wide">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">القاهرة، جمهورية مصر العربية</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm" dir="ltr">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">info@almasa-jewelry.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} الماسة للمجوهرات. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-6 text-xs text-gray-500">
            <Link href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</Link>
            <Link href="#" className="hover:text-primary transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
