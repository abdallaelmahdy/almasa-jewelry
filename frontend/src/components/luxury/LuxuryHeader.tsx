"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X, LayoutDashboard, LogIn } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"

export function LuxuryHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()
  const { user } = useAuthStore()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "المجموعات", href: "/#collections" },
    { name: "المجوهرات", href: "/#shop" },
    { name: "عن الماسة", href: "/#heritage" },
    { name: "تواصل معنا", href: "/#contact" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out",
        isScrolled 
          ? "bg-background border-b border-white/5 py-5 shadow-2xl" 
          : "bg-gradient-to-b from-black/50 to-transparent border-b border-transparent py-8"
      )}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
        <div className="flex items-center justify-between">
          
          {/* Desktop Nav - Right side (RTL) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12 flex-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={cn(
                  "font-sans text-[11px] uppercase tracking-luxury transition-colors hover:text-white relative py-1",
                  isScrolled ? "text-white/60" : "text-white/80",
                  pathname === link.href && "text-white"
                )}
              >
                {link.name}
                <span className={cn(
                  "absolute bottom-0 left-0 w-full h-[1px] bg-primary transition-transform duration-500 origin-right",
                  pathname === link.href ? "scale-x-100" : "scale-x-0 hover:scale-x-100"
                )} />
              </Link>
            ))}
          </nav>

          {/* Logo - Center */}
          <Link href="/" className="flex flex-col items-center justify-center flex-none group">
            <span className={cn(
              "font-display text-2xl lg:text-3xl font-bold tracking-wide transition-colors duration-500",
              "text-white"
            )}>
              الماسة
            </span>
            <span className={cn(
              "font-sans text-[9px] uppercase tracking-[0.3em] transition-colors duration-500 mt-1",
              isScrolled ? "text-primary/80" : "text-white/60 group-hover:text-primary/80"
            )}>
              للمجوهرات
            </span>
          </Link>

          {/* Actions - Left side (RTL) */}
          <div className="hidden md:flex items-center justify-end gap-6 flex-1">
            {user ? (
              <Link 
                href="/dashboard" 
                className={cn(
                  "flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxury transition-colors hover:text-white pb-1 border-b border-transparent hover:border-white/30",
                  isScrolled ? "text-white/60" : "text-white/80"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                لوحة القيادة
              </Link>
            ) : (
              <Link 
                href="/login" 
                className={cn(
                  "flex items-center gap-2 font-sans text-[11px] uppercase tracking-luxury transition-colors hover:text-white pb-1 border-b border-transparent hover:border-white/30",
                  isScrolled ? "text-white/60" : "text-white/80"
                )}
              >
                <LogIn className="w-3.5 h-3.5" />
                دخول الإدارة
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden z-[60] p-2 text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Full Screen Cinematic Overlay) */}
      <div 
        className={cn(
          "fixed inset-0 bg-[#080808] z-[55] flex flex-col items-center justify-center transition-all duration-700 ease-in-out md:hidden",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        {/* Subtle background element */}
        <div className="absolute inset-0 bg-[url('/images/jewelry/hero/hero-bg.jpg')] bg-cover bg-center opacity-5 mix-blend-screen" />
        
        <nav className="flex flex-col items-center gap-10 relative z-10 w-full px-6">
          {navLinks.map((link, index) => (
            <Link 
              key={link.name} 
              href={link.href}
              className={cn(
                "font-display text-3xl md:text-4xl text-white/70 hover:text-white transition-all duration-500 transform",
                isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className={cn(
            "h-px w-16 bg-white/10 my-6 transition-all duration-700 delay-500",
            isMobileMenuOpen ? "scale-x-100" : "scale-x-0"
          )} />
          
          {user ? (
            <Link 
              href="/dashboard" 
              className={cn(
                "flex items-center gap-2 font-sans text-xs tracking-luxury uppercase text-primary hover:text-white transition-all duration-500 transform",
                isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: "600ms" }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              لوحة القيادة
            </Link>
          ) : (
            <Link 
              href="/login" 
              className={cn(
                "flex items-center gap-2 font-sans text-xs tracking-luxury uppercase text-primary hover:text-white transition-all duration-500 transform",
                isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: "600ms" }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LogIn className="w-4 h-4" />
              دخول الإدارة
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
