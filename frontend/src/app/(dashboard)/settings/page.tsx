"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useCreateGoldPrice, useGoldPrice } from "@/hooks/usePOS";
import { useUsers, useCreateUser, useDeactivateUser } from "@/hooks/useUsers";
import { formatMoneyExact } from "@/lib/format";

const KARATS = [18, 21, 22, 24] as const;

const ROLE_LABEL: Record<string, string> = {
  admin: "مدير",
  employee: "موظف",
};

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const price18 = useGoldPrice(18);
  const price21 = useGoldPrice(21);
  const price22 = useGoldPrice(22);
  const price24 = useGoldPrice(24);
  const prices = {
    18: price18.data,
    21: price21.data,
    22: price22.data,
    24: price24.data,
  };

  const createGold = useCreateGoldPrice();
  const createUser = useCreateUser();
  const deactivateUser = useDeactivateUser();
  const { data: users, isLoading: usersLoading } = useUsers();

  const [karat, setKarat] = useState<number>(21);
  const [pricePerGram, setPricePerGram] = useState("");
  const [goldMessage, setGoldMessage] = useState<string | null>(null);
  const [goldError, setGoldError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  if (!isAdmin) return null;

  const onSubmitGold = async (e: FormEvent) => {
    e.preventDefault();
    setGoldMessage(null);
    setGoldError(null);
    const trimmed = pricePerGram.trim();
    if (!trimmed || Number(trimmed) < 0) {
      setGoldError("أدخل سعراً صالحاً للجرام");
      return;
    }
    try {
      await createGold.mutateAsync({ karat, price_per_gram: trimmed });
      setGoldMessage("تم تسجيل سعر الذهب الجديد");
      setPricePerGram("");
    } catch {
      setGoldError("تعذر حفظ سعر الذهب");
    }
  };

  const onSubmitUser = async (e: FormEvent) => {
    e.preventDefault();
    setUserMessage(null);
    setUserError(null);
    if (password.length < 12) {
      setUserError("كلمة المرور يجب أن تكون 12 حرفاً على الأقل");
      return;
    }
    try {
      await createUser.mutateAsync({ username, email, password, role });
      setUserMessage("تم إنشاء المستخدم بنجاح");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("employee");
    } catch {
      setUserError("تعذر إنشاء المستخدم. تحقق من عدم تكرار البريد أو اسم المستخدم.");
    }
  };

  const handleDeactivate = async (userId: number) => {
    setDeactivateError(null);
    try {
      await deactivateUser.mutateAsync(userId);
    } catch {
      setDeactivateError("تعذر إلغاء تفعيل الحساب");
    }
  };

  return (
    <div className="bg-[#0A0A0A] w-full h-full text-white font-sans overflow-y-auto p-6 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        <p className="text-sm text-white/50">إدارة أسعار الذهب وإنشاء حسابات الموظفين</p>

        {/* ── Gold Prices ── */}
        <section className="bg-[#111111] rounded-xl p-5 border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white/80">أسعار الذهب الحالية</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {KARATS.map((k) => (
              <div key={k} className="rounded-lg border border-white/5 bg-[#0A0A0A] p-4 text-center">
                <div className="text-xs text-white/50 mb-1">عيار {k}</div>
                <div className="text-lg font-bold text-[#D4AF37]">
                  {formatMoneyExact(prices[k]?.price_per_gram)}{" "}
                  <span className="text-xs text-white/40">ج.م</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={onSubmitGold} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <label className="flex flex-col gap-2 text-xs text-white/60">
              العيار
              <select
                value={karat}
                onChange={(e) => setKarat(Number(e.target.value))}
                className="h-10 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 text-sm text-white"
              >
                {KARATS.map((k) => (
                  <option key={k} value={k}>
                    عيار {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs text-white/60">
              السعر للجرام (ج.م)
              <input
                dir="ltr"
                inputMode="decimal"
                value={pricePerGram}
                onChange={(e) => setPricePerGram(e.target.value)}
                className="h-10 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 text-sm text-white text-start"
                placeholder="0.00"
              />
            </label>
            <button
              type="submit"
              disabled={createGold.isPending}
              className="h-10 rounded-lg bg-[#D4AF37] text-black text-sm font-bold hover:bg-[#F3E5AB] disabled:opacity-50"
            >
              {createGold.isPending ? "جاري الحفظ..." : "تسجيل سعر جديد"}
            </button>
          </form>
          {goldMessage && <p className="text-xs text-emerald-400">{goldMessage}</p>}
          {goldError && <p className="text-xs text-red-400">{goldError}</p>}
        </section>

        {/* ── Create User ── */}
        <section className="bg-[#111111] rounded-xl p-5 border border-white/5 space-y-5">
          <h2 className="text-sm font-bold text-white/80">إنشاء مستخدم</h2>
          <form onSubmit={onSubmitUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex flex-col gap-2 text-xs text-white/60">
              اسم المستخدم
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 text-sm text-white"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-white/60">
              البريد الإلكتروني
              <input
                required
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 text-sm text-white text-start"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-white/60">
              كلمة المرور
              <input
                required
                type="password"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 text-sm text-white text-start"
                placeholder="12 حرفاً على الأقل"
              />
            </label>
            <label className="flex flex-col gap-2 text-xs text-white/60">
              الدور
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "employee")}
                className="h-10 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 text-sm text-white"
              >
                <option value="employee">موظف</option>
                <option value="admin">مدير</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={createUser.isPending}
              className="h-10 md:col-span-2 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37] text-sm font-bold hover:bg-[#D4AF37]/10 disabled:opacity-50"
            >
              {createUser.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>
          {userMessage && <p className="text-xs text-emerald-400">{userMessage}</p>}
          {userError && <p className="text-xs text-red-400">{userError}</p>}
        </section>

        {/* ── Users List ── */}
        <section className="bg-[#111111] rounded-xl p-5 border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white/80">قائمة المستخدمين</h2>
          {deactivateError && <p className="text-xs text-red-400">{deactivateError}</p>}
          {usersLoading ? (
            <p className="text-xs text-white/40">جاري التحميل...</p>
          ) : !users || users.length === 0 ? (
            <p className="text-xs text-white/40">لا يوجد مستخدمون</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-white/40">
                    <th className="py-2 pe-3 font-normal">اسم المستخدم</th>
                    <th className="py-2 pe-3 font-normal">البريد</th>
                    <th className="py-2 pe-3 font-normal">الدور</th>
                    <th className="py-2 pe-3 font-normal">الحالة</th>
                    <th className="py-2 font-normal"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 pe-3 font-medium">{u.username}</td>
                      <td className="py-3 pe-3 text-white/60" dir="ltr">{u.email}</td>
                      <td className="py-3 pe-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            u.role === "admin"
                              ? "bg-[#D4AF37]/15 text-[#D4AF37]"
                              : "bg-white/5 text-white/50"
                          }`}
                        >
                          {ROLE_LABEL[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="py-3 pe-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            u.is_active
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {u.is_active ? "نشط" : "معطل"}
                        </span>
                      </td>
                      <td className="py-3 text-end">
                        {u.is_active && u.id !== user?.id && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            disabled={deactivateUser.isPending}
                            className="text-[11px] text-red-400/70 hover:text-red-400 disabled:opacity-40 border border-red-500/20 rounded px-2 py-1 hover:bg-red-500/10 transition-colors"
                          >
                            إلغاء التفعيل
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
