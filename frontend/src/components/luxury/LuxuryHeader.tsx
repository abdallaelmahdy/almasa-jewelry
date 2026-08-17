"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X, LayoutDashboard, ShoppingBag, LogIn, LogOut, User } from "lucide-react"
import { useCustomerAuth } from "@/stores/customerAuthStore"
import { useCustomerCart } from "@/stores/customerCartStore"
import { CustomerAuthModal } from "@/components/luxury/CustomerAuthModal"
import { CustomerCartSidebar } from "@/components/luxury/CustomerCartSidebar"

export function LuxuryHeader() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [authModal, setAuthModal] = React.useState<{ open: boolean; tab: "login" | "register" }>({ open: false, tab: "login" })
  const [cartOpen, setCartOpen] = React.useState(false)

  const pathname = usePathname()
  const { customer, clearAuth } = useCustomerAuth()
  const { items } = useCustomerCart()

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
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
    <>
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

            {/* Logo */}
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

            {/* Right actions */}
            <div className="hidden md:flex items-center justify-end gap-5 flex-1">
              {/* Customer auth */}
              {customer ? (
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "font-sans text-xs",
                    isScrolled ? "text-foreground/60" : "text-white/60"
                  )}>
                    <User className="w-3.5 h-3.5 inline me-1" />
                    {customer.username}
                  </span>
                  <button
                    onClick={clearAuth}
                    className={cn(
                      "flex items-center gap-1.5 font-sans text-xs transition-colors",
                      isScrolled ? "text-foreground/50 hover:text-foreground" : "text-white/50 hover:text-white"
                    )}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    خروج
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAuthModal({ open: true, tab: "login" })}
                    className={cn(
                      "font-sans text-xs transition-colors pb-1 border-b border-transparent hover:border-current",
                      isScrolled ? "text-foreground/80 hover:text-foreground" : "text-white/80 hover:text-white"
                    )}
                  >
                    تسجيل الدخول
                  </button>
                  <span className={cn("text-xs", isScrolled ? "text-foreground/20" : "text-white/20")}>/</span>
                  <button
                    onClick={() => setAuthModal({ open: true, tab: "register" })}
                    className="font-sans text-xs px-4 py-1.5 rounded border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                  >
                    إنشاء حساب
                  </button>
                </div>
              )}

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className={cn(
                  "relative p-1.5 transition-colors",
                  isScrolled ? "text-foreground/80 hover:text-foreground" : "text-white/80 hover:text-white"
                )}
              >
                <ShoppingBag className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -start-1 bg-[#D4AF37] text-black text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu toggle */}
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

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 bg-background z-[55] flex flex-col items-center justify-center transition-all duration-700 ease-in-out md:hidden",
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}
        >
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

            {customer ? (
              <button
                onClick={() => { clearAuth(); setIsMobileMenuOpen(false); }}
                className={cn(
                  "flex items-center gap-2 font-sans text-sm text-primary hover:text-primary/80 transition-all duration-500 transform",
                  isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: "600ms" }}
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            ) : (
              <button
                onClick={() => { setAuthModal({ open: true, tab: "login" }); setIsMobileMenuOpen(false); }}
                className={cn(
                  "flex items-center gap-2 font-sans text-sm text-primary hover:text-primary/80 transition-all duration-500 transform",
                  isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                )}
                style={{ transitionDelay: "600ms" }}
              >
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </button>
            )}

            {/* Mobile cart */}
            <button
              onClick={() => { setCartOpen(true); setIsMobileMenuOpen(false); }}
              className={cn(
                "flex items-center gap-2 font-sans text-sm text-foreground/60 hover:text-foreground transition-all duration-500 transform",
                isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: "700ms" }}
            >
              <ShoppingBag className="w-4 h-4" />
              السلة {items.length > 0 && `(${items.length})`}
            </button>

            {/* Employee login — discreet link in mobile menu */}
            <Link
              href="/login"
              className={cn(
                "font-sans text-xs text-foreground/30 hover:text-foreground/60 transition-all duration-500 transform mt-4",
                isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
              style={{ transitionDelay: "800ms" }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              دخول الموظفين
            </Link>
          </nav>
        </div>
      </header>

      {/* Modals */}
      <CustomerAuthModal
        open={authModal.open}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        defaultTab={authModal.tab}
      />
      <CustomerCartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onRequestAuth={() => setAuthModal({ open: true, tab: "login" })}
      />
    </>
  )
}
