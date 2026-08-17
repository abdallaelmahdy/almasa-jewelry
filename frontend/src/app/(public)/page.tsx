"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ShoppingBag, Sparkles, ArrowDown, Filter, Search } from "lucide-react";
import { publicApi, type PublicProduct, type PublicGoldPrice } from "@/lib/publicApi";
import { GoldPriceTicker } from "@/components/luxury/GoldPriceTicker";
import { useCustomerCart } from "@/stores/customerCartStore";
import { cn } from "@/lib/utils";

// ── Hooks ─────────────────────────────────────────────────────────────────────
function usePublicProducts(params: { karat?: number; search?: string; limit?: number }) {
  return useQuery({
    queryKey: ["publicProducts", params],
    queryFn: async () => {
      const query = new URLSearchParams({ limit: String(params.limit ?? 24) });
      if (params.karat) query.set("karat", String(params.karat));
      if (params.search) query.set("search", params.search);
      const { data } = await publicApi.get<PublicProduct[]>(`/public/products?${query}`);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

function usePublicGoldPrices() {
  return useQuery({
    queryKey: ["publicGoldPrices"],
    queryFn: async () => {
      const { data } = await publicApi.get<PublicGoldPrice[]>("/public/gold-prices");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
const KARAT_FILTERS = [
  { label: "الكل", value: undefined },
  { label: "عيار 18", value: 18 },
  { label: "عيار 21", value: 21 },
  { label: "عيار 22", value: 22 },
  { label: "عيار 24", value: 24 },
];

export default function StorefrontHomepage() {
  const [karatFilter, setKaratFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [heroVisible, setHeroVisible] = useState(false);

  const { addItem, removeItem, hasItem } = useCustomerCart();
  const { data: products, isLoading: productsLoading } = usePublicProducts({ karat: karatFilter, search: debouncedSearch });
  const { data: prices } = usePublicGoldPrices();

  // Hero entrance
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const getPrice = (karat: number) => {
    const p = prices?.find((p) => p.karat === karat);
    return p ? Number(p.price_per_gram) : null;
  };

  const calcPrice = (item: PublicProduct) => {
    const perGram = getPrice(item.karat);
    if (!perGram) return null;
    return (perGram * parseFloat(item.weight)).toLocaleString("ar-EG", { maximumFractionDigits: 0 });
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen" dir="rtl">

      {/* ═══════════════════════════ HERO ══════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%), #0A0A0A",
        }}
      >
        {/* Ambient dots grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Gold horizontal rule */}
        <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-l from-transparent via-[#D4AF37]/20 to-transparent" />

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-16 w-full pt-32 pb-24 flex flex-col lg:flex-row items-center justify-between gap-16">

          {/* Left content (RTL = right side visually) */}
          <div className={cn(
            "flex flex-col gap-6 max-w-xl transition-all duration-1000",
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}>
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#D4AF37]/80">
                مجوهرات ذهبية أصيلة
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-[1.05]">
              أناقة<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #D4AF37, #F3E5AB, #D4AF37)" }}>
                تدوم
              </span>
            </h1>

            {/* Sub */}
            <p className="font-sans text-lg md:text-xl text-white/60 leading-relaxed max-w-md">
              اكتشف أجمل تشكيلات المجوهرات الذهبية،<br />
              مُصنوعة بإتقان وبأعلى معايير الجودة.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href="#shop"
                className="px-8 py-4 bg-[#D4AF37] hover:bg-[#E5C04A] text-black font-bold font-sans text-sm rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                تسوق الآن
              </a>
              <a
                href="#heritage"
                className="px-8 py-4 border border-white/15 hover:border-[#D4AF37]/40 text-white/70 hover:text-white font-sans text-sm rounded-xl transition-all duration-300"
              >
                عن الماسة
              </a>
            </div>
          </div>

          {/* Right decorative element */}
          <div className={cn(
            "relative hidden lg:block transition-all duration-1200 delay-300",
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <div className="relative w-72 h-72 xl:w-96 xl:h-96">
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
                  animation: "pulse 4s ease-in-out infinite",
                }}
              />
              {/* Gold circle */}
              <div className="absolute inset-8 rounded-full border border-[#D4AF37]/20 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full border border-[#D4AF37]/10" />
                <div className="text-center">
                  <p className="font-display text-6xl xl:text-7xl text-[#D4AF37] opacity-90">✦</p>
                  <p className="font-sans text-[11px] uppercase tracking-[0.3em] text-white/30 mt-4">الماسة</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll arrow */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <ArrowDown className="w-4 h-4 text-white/20" />
        </div>
      </section>

      {/* ═══════════════════════ GOLD PRICE TICKER ═════════════════════════════ */}
      <GoldPriceTicker />

      {/* ═══════════════════════════ SHOP ═══════════════════════════════════════ */}
      <section id="shop" className="py-24 max-w-[1600px] mx-auto px-6 lg:px-16">

        {/* Section header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]/60 mb-2">متجرنا</p>
            <h2 className="font-display text-3xl md:text-4xl text-white">المجوهرات المتاحة</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث..."
                className="h-10 ps-9 pe-4 rounded-xl bg-white/5 border border-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]/40 transition-colors w-40 md:w-52"
              />
            </div>

            {/* Karat filter pills */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/30" />
              {KARAT_FILTERS.map((f) => (
                <button
                  key={f.label}
                  onClick={() => setKaratFilter(f.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-sans transition-all",
                    karatFilter === f.value
                      ? "bg-[#D4AF37] text-black font-bold"
                      : "border border-white/10 text-white/50 hover:border-[#D4AF37]/40 hover:text-white"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-white/5 rounded-2xl mb-4" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <p className="font-display text-2xl text-white/20">لا توجد قطع متاحة</p>
            <p className="font-sans text-sm text-white/20">جرّب تغيير فلتر البحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((item) => {
              const inCart = hasItem(item.id);
              const priceStr = calcPrice(item);

              return (
                <article
                  key={item.id}
                  className={cn(
                    "group relative flex flex-col cursor-pointer",
                    inCart && "ring-1 ring-[#D4AF37]/30 rounded-2xl"
                  )}
                >
                  {/* Image */}
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-white/3">
                    {item.product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                      />
                    ) : (
                      /* Elegant placeholder */
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/3 to-transparent">
                        <span className="text-4xl text-[#D4AF37]/20">✦</span>
                        <span className="font-sans text-[10px] text-white/20 mt-3 uppercase tracking-widest">
                          {item.product.category.name}
                        </span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-700" />

                    {/* In-cart badge */}
                    {inCart && (
                      <div className="absolute top-3 start-3 bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-1 rounded-lg">
                        في السلة
                      </div>
                    )}

                    {/* Quick add button (appears on hover) */}
                    <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <button
                        onClick={() => inCart ? removeItem(item.id) : addItem(item)}
                        className={cn(
                          "w-full py-2.5 rounded-xl text-sm font-bold font-sans transition-colors flex items-center justify-center gap-2",
                          inCart
                            ? "bg-red-500/80 hover:bg-red-500 text-white"
                            : "bg-[#D4AF37] hover:bg-[#E5C04A] text-black"
                        )}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        {inCart ? "إزالة من السلة" : "أضف للسلة"}
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="pt-5 flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {item.product.category.name}
                      </span>
                      <span className="w-1 h-px bg-white/10" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37]/70">
                        عيار {item.karat}
                      </span>
                    </div>
                    <h3 className="font-display text-white text-lg group-hover:text-[#D4AF37] transition-colors duration-500">
                      {item.product.name}
                    </h3>
                    <div className="flex items-end justify-between mt-2 pt-3 border-t border-white/5">
                      <div>
                        {priceStr ? (
                          <span className="font-sans text-sm text-[#D4AF37]">
                            {priceStr} ج.م
                          </span>
                        ) : (
                          <span className="font-sans text-xs text-white/30">حسب سعر اليوم</span>
                        )}
                        <p className="font-sans text-xs text-white/30 mt-0.5">{item.weight}غ</p>
                      </div>
                      <button
                        onClick={() => inCart ? removeItem(item.id) : addItem(item)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          inCart
                            ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                            : "bg-white/5 hover:bg-[#D4AF37]/10 text-white/40 hover:text-[#D4AF37]"
                        )}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══════════════════════════ HERITAGE ════════════════════════════════════ */}
      <section
        id="heritage"
        className="py-32 border-t border-white/5"
        style={{
          background: "linear-gradient(180deg, #0A0A0A 0%, #0D0A06 50%, #0A0A0A 100%)",
        }}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]/60 mb-4">عن الدار</p>
                <h2 className="font-display text-4xl md:text-5xl text-white leading-tight">
                  إرث من الذهب<br />
                  وفن الصياغة
                </h2>
              </div>
              <p className="font-sans text-white/50 leading-relaxed text-base md:text-lg max-w-md">
                في الماسة للمجوهرات، نؤمن بأن كل قطعة ذهبية تحمل قصة. نصوغ مجوهراتنا بأيدٍ ماهرة وقلوب عاشقة، جامعين بين أصالة التراث المصري وجماليات التصميم المعاصر.
              </p>
              <div className="grid grid-cols-3 gap-8 pt-4 border-t border-white/5">
                {[
                  { num: "+١٥", label: "سنة خبرة" },
                  { num: "+٥٠٠٠", label: "قطعة مُباعة" },
                  { num: "١٠٠٪", label: "ذهب أصيل" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display text-2xl md:text-3xl text-[#D4AF37]">{stat.num}</p>
                    <p className="font-sans text-xs text-white/40 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative gold element */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div
                  className="absolute inset-0 rounded-full border border-[#D4AF37]/10"
                  style={{ animation: "spin 30s linear infinite" }}
                />
                <div
                  className="absolute inset-8 rounded-full border border-[#D4AF37]/20"
                  style={{ animation: "spin 20s linear infinite reverse" }}
                />
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                  <p className="font-display text-8xl text-[#D4AF37]/20">✦</p>
                  <p className="font-display text-xl text-white/60">الماسة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ CONTACT ═════════════════════════════════════ */}
      <section id="contact" className="py-24 border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16 text-center">
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]/60 mb-4">تواصل معنا</p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6">احجز استشارتك</h2>
          <p className="font-sans text-white/50 text-base max-w-xl mx-auto mb-12">
            فريقنا جاهز لمساعدتك في اختيار القطعة المثالية. تواصل معنا اليوم وسنرد عليك في أقرب وقت.
          </p>
          <a
            href="mailto:info@almasa.com"
            className="inline-flex items-center gap-3 px-10 py-4 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-bold font-sans text-sm rounded-xl transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            info@almasa.com
          </a>
        </div>
      </section>
    </div>
  );
}
