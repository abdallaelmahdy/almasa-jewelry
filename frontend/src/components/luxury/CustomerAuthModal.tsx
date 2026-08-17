"use client";

import * as React from "react";
import { useState, useTransition, useRef, useEffect } from "react";
import { X, Eye, EyeOff, Loader2, User, Mail, Lock, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useCustomerAuth } from "@/stores/customerAuthStore";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CustomerAuthModal({ open, onClose, defaultTab = "login" }: Props) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { setAuth } = useCustomerAuth();

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTab(defaultTab);
    setLoginError(null);
    setRegError(null);
    setRegSuccess(false);
  }, [open, defaultTab]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    startTransition(async () => {
      try {
        const form = new URLSearchParams();
        form.append("username", loginUsername);
        form.append("password", loginPassword);
        const { data: tokenData } = await api.post("/auth/login", form, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        // Fetch customer profile
        const headers = { Authorization: `Bearer ${tokenData.access_token}` };
        const { data: userData } = await api.get("/users/me", { headers });
        if (userData.role !== "customer") {
          setLoginError("هذه البوابة للعملاء فقط. استخدم بوابة الموظفين للدخول.");
          return;
        }
        setAuth(userData, tokenData.access_token);
        onClose();
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        setLoginError(typeof detail === "string" ? detail : "بيانات الدخول غير صحيحة");
      }
    });
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    startTransition(async () => {
      try {
        await api.post("/auth/register", {
          username: regUsername,
          email: regEmail,
          password: regPassword,
        });
        setRegSuccess(true);
      } catch (err: any) {
        const detail = err?.response?.data?.detail;
        setRegError(typeof detail === "string" ? detail : "حدث خطأ. حاول مرة أخرى.");
      }
    });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full max-w-md bg-[#0e0e0e] border border-white/8 rounded-2xl overflow-hidden shadow-2xl"
        style={{ boxShadow: "0 0 80px rgba(212,175,55,0.08)" }}
      >
        {/* ── Gold accent top bar ── */}
        <div className="h-[2px] w-full bg-gradient-to-l from-transparent via-[#D4AF37] to-transparent" />

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="absolute top-4 start-4 p-2 text-white/30 hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8">
          {/* ── Logo ── */}
          <div className="text-center mb-8">
            <p className="font-display text-2xl text-white">الماسة</p>
            <p className="font-sans text-[10px] uppercase tracking-luxury-wide text-[#D4AF37] mt-1">للمجوهرات</p>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-white/8 mb-8">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(null); setRegError(null); setRegSuccess(false); }}
                className={cn(
                  "flex-1 pb-3 text-sm font-sans transition-colors",
                  tab === t
                    ? "text-[#D4AF37] border-b-2 border-[#D4AF37] -mb-[1px]"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {t === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
              </button>
            ))}
          </div>

          {/* ── Login Form ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="اسم المستخدم"
                  className="w-full ps-10 pe-4 h-11 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full ps-10 pe-10 h-11 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginError && (
                <p className="text-sm text-red-400 text-center">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-[#D4AF37] hover:bg-[#E5C04A] disabled:opacity-60 text-black font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "دخول"}
              </button>
            </form>
          )}

          {/* ── Register Form ── */}
          {tab === "register" && !regSuccess && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="اسم المستخدم"
                  className="w-full ps-10 pe-4 h-11 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
                />
              </div>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  required
                  type="email"
                  dir="ltr"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  className="w-full ps-10 pe-4 h-11 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors text-start"
                />
              </div>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="كلمة المرور (12 حرفاً على الأقل)"
                  className="w-full ps-10 pe-10 h-11 rounded-lg bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regError && (
                <p className="text-sm text-red-400 text-center">{regError}</p>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 disabled:opacity-60 text-[#D4AF37] font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء الحساب"}
              </button>
            </form>
          )}

          {/* ── Register Success ── */}
          {tab === "register" && regSuccess && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="font-sans text-white text-base">تم إنشاء حسابك بنجاح!</p>
              <p className="font-sans text-sm text-white/50">يمكنك الآن تسجيل الدخول</p>
              <button
                onClick={() => { setRegSuccess(false); setTab("login"); }}
                className="w-full h-11 bg-[#D4AF37] hover:bg-[#E5C04A] text-black font-bold text-sm rounded-lg transition-colors"
              >
                تسجيل الدخول
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
