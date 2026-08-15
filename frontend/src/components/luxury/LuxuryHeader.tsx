"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Diamond, Menu, X } from "lucide-react"

export function LuxuryHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "المجوهرات", href: "/#categories" },
    { name: "أحدث التشكيلات", href: "/#featured" },
    { name: "عن الماسة", href: "/#about" },
    { name: "تواصل معنا", href: "/#contact" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        isScrolled 
          ? "bg-[#0d0d0d]/95 backdrop-blur-md border-border py-4 shadow-lg shadow-black/50" 
          : "bg-transparent border-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group z-50">
            <Diamond className={cn(
              "w-8 h-8 transition-colors duration-300", 
              isScrolled ? "text-primary" : "text-primary md:text-white group-hover:text-primary"
            )} />
            <div className="flex flex-col">
              <span className={cn(
                "text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300",
                isScrolled ? "text-white" : "text-white"
              )}>
                الماسة
              </span>
              <span className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-colors duration-300",
                isScrolled ? "text-primary" : "text-gray-300 group-hover:text-primary"
              )}>
                للمجوهرات
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-primary after:transition-all hover:after:w-full",
                  isScrolled ? "text-gray-300" : "text-gray-100",
                  pathname === link.href && "text-primary after:w-full"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isScrolled ? "text-gray-300" : "text-gray-100"
              )}
            >
              تسجيل الدخول
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden z-50 p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 bg-[#0d0d0d] flex flex-col items-center justify-center transition-transform duration-500 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="flex flex-col items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-2xl font-bold text-gray-300 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px w-24 bg-border my-4" />
          <Link 
            href="/login" 
            className="text-xl font-medium text-primary hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            تسجيل الدخول
          </Link>
        </nav>
      </div>
    </header>
  )
}
