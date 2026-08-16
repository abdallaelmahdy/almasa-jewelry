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
          ? "bg-background border-b border-border py-5 shadow-sm" 
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
                  "font-sans text-xs transition-colors relative py-1",
                  isScrolled ? "text-foreground/80 hover:text-foreground" : "text-white/80 hover:text-white",
                  pathname === link.href && (isScrolled ? "text-foreground font-semibold" : "text-white font-semibold")
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

          <Link href="/" className="flex flex-col items-center justify-center flex-none group">
            <span className={cn(
              "font-display text-2xl lg:text-3xl font-bold transition-colors duration-500",
              isScrolled ? "text-foreground" : "text-white"
            )}>
              الماسة
            </span>
            <span className={cn(
              "font-sans text-[10px] transition-colors duration-500 mt-1",
              isScrolled ? "text-primary" : "text-white/80 group-hover:text-primary"
            )}>
              للمجوهرات
            </span>
          </Link>

          <div className="hidden md:flex items-center justify-end gap-6 flex-1">
            {user ? (
              <Link 
                href="/dashboard" 
                className={cn(
                  "flex items-center gap-2 font-sans text-xs transition-colors pb-1 border-b border-transparent",
                  isScrolled ? "text-foreground/80 hover:text-foreground hover:border-foreground/30" : "text-white/80 hover:text-white hover:border-white/30"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                لوحة القيادة
              </Link>
            ) : (
              <Link 
                href="/login" 
                className={cn(
                  "flex items-center gap-2 font-sans text-xs transition-colors pb-1 border-b border-transparent",
                  isScrolled ? "text-foreground/80 hover:text-foreground hover:border-foreground/30" : "text-white/80 hover:text-white hover:border-white/30"
                )}
              >
                <LogIn className="w-3.5 h-3.5" />
                دخول الإدارة
              </Link>
            )}
          </div>

          <button 
            className={cn(
              "md:hidden z-[60] p-2 transition-colors",
              isScrolled ? (isMobileMenuOpen ? "text-white" : "text-foreground/80 hover:text-foreground") : "text-white/80 hover:text-white"
            )}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div 
        className={cn(
          "fixed inset-0 bg-background z-[55] flex flex-col items-center justify-center transition-all duration-700 ease-in-out md:hidden",
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
                "font-display text-3xl md:text-4xl text-foreground/70 hover:text-foreground transition-all duration-500 transform",
                isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          <div className={cn(
            "h-px w-16 bg-border my-6 transition-all duration-700 delay-500",
            isMobileMenuOpen ? "scale-x-100" : "scale-x-0"
          )} />
          
          {user ? (
            <Link 
              href="/dashboard" 
              className={cn(
                "flex items-center gap-2 font-sans text-sm text-primary hover:text-primary/80 transition-all duration-500 transform",
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
                "flex items-center gap-2 font-sans text-sm text-primary hover:text-primary/80 transition-all duration-500 transform",
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
