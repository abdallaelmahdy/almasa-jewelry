"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { InventoryItemOut } from "@/types/inventory";
import { LuxurySection, LuxurySectionHeader, LuxurySectionTitle, LuxurySectionDescription } from "@/components/luxury/LuxurySection";
import { LuxuryProductCard } from "@/components/luxury/LuxuryProductCard";
import { LuxuryCategoryCard } from "@/components/luxury/LuxuryCategoryCard";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { GoldPriceTicker } from "@/components/luxury/GoldPriceTicker";
import { ShieldCheck, Gem, Award, Clock } from "lucide-react";

const CATEGORIES = ["الكل", "خواتم", "سلاسل", "غوايش", "حلقان", "دلايات", "سبائك"];

const CATEGORY_CARDS = [
  { name: "خواتم ومحابس", imageUrl: "/images/jewelry/rings/ring-01.jpg", href: "/#shop" },
  { name: "سلاسل وأطقم", imageUrl: "/images/jewelry/necklaces/necklace-02.jpg", href: "/#shop" },
  { name: "أساور وغوايش", imageUrl: "/images/jewelry/bracelets/bracelet-01.jpg", href: "/#shop" },
  { name: "سبائك وجنيهات", imageUrl: "/images/jewelry/bullion/bullion-01.jpg", href: "/#shop" }
];

// Fallback logic for images
function getProductCategory(name: string): string {
  if (name.includes("خاتم") || name.includes("محبس")) return "خواتم";
  if (name.includes("سلسال") || name.includes("عقد") || name.includes("كوليه") || name.includes("طقم")) return "سلاسل";
  if (name.includes("غويشة") || name.includes("اسورة") || name.includes("انسيال")) return "غوايش";
  if (name.includes("حلق")) return "حلقان";
  if (name.includes("سبيكة") || name.includes("جنيه")) return "سبائك";
  return "أخرى";
}

const FALLBACK_IMAGES: Record<string, string> = {
  "خواتم": "/images/jewelry/rings/ring-01.jpg",
  "سلاسل": "/images/jewelry/necklaces/necklace-02.jpg",
  "غوايش": "/images/jewelry/bracelets/bracelet-01.jpg",
  "حلقان": "/images/jewelry/earrings/earrings-01.jpg",
  "سبائك": "/images/jewelry/bullion/bullion-01.jpg",
  "أخرى": "/images/jewelry/necklaces/necklace-02.jpg"
};

const MOCK_PRODUCTS = [
  { id: 1, product: { name: "خاتم ذهب إيطالي عيار 18" }, category: "خواتم", weight: "4.5", karat: 18, price: "حسب السعر اليومي" },
  { id: 2, product: { name: "سلسال ذهب ناعم عيار 21" }, category: "سلاسل", weight: "8.2", karat: 21, price: "حسب السعر اليومي" },
  { id: 3, product: { name: "غويشة عريضة سادة عيار 21" }, category: "غوايش", weight: "22.5", karat: 21, price: "حسب السعر اليومي" },
  { id: 4, product: { name: "حلق ذهب لازوردي عيار 18" }, category: "حلقان", weight: "3.1", karat: 18, price: "حسب السعر اليومي" },
];

export default function PublicHomepage() {
  const [activeCategory, setActiveCategory] = useState("الكل");

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["public_inventory"],
    queryFn: async () => {
      const { data } = await api.get<InventoryItemOut[]>("/inventory", {
        params: { status: "AVAILABLE", limit: 20 },
      });
      return data;
    },
  });

  const rawProducts = (inventoryData && inventoryData.length > 0) ? inventoryData : MOCK_PRODUCTS as any;

  const products = rawProducts.map((item: any) => {
    const category = getProductCategory(item.product.name);
    return {
      id: item.id,
      title: item.product.name,
      category: category,
      price: "حسب السعر اليومي",
      weight: item.weight,
      karat: item.karat,
      imageUrl: FALLBACK_IMAGES[category] || FALLBACK_IMAGES["أخرى"]
    };
  });

  const filteredProducts = activeCategory === "الكل" 
    ? products 
    : products.filter((p: any) => p.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Cinematic Hero */}
      <LuxurySection variant="cinematic" cinematicImageUrl="/images/jewelry/hero/hero-bg.jpg" className="pt-32">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            أناقة <span className="text-primary italic pr-2">تدوم</span> <br/> عبر الأجيال
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            اكتشفي أرقى التشكيلات من الذهب والمجوهرات الفاخرة، المصاغة بدقة لتناسب ذوقك الرفيع.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <LuxuryButton size="lg" className="w-full sm:w-auto px-12 h-14 text-lg">
              تسوق مجموعتنا
            </LuxuryButton>
            <LuxuryButton size="lg" variant="outline" className="w-full sm:w-auto px-12 h-14 text-lg bg-black/20 backdrop-blur-sm">
              تواصل معنا
            </LuxuryButton>
          </div>
        </div>
      </LuxurySection>

      {/* Gold Price Ticker */}
      <GoldPriceTicker />

      {/* Categories Grid */}
      <LuxurySection id="categories" className="pb-12 pt-24">
        <LuxurySectionHeader>
          <LuxurySectionTitle>مجموعات الماسة</LuxurySectionTitle>
          <LuxurySectionDescription>
            تصفح تشكيلاتنا المتنوعة من المجوهرات الفاخرة
          </LuxurySectionDescription>
        </LuxurySectionHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORY_CARDS.map((cat, idx) => (
            <LuxuryCategoryCard key={idx} category={cat} />
          ))}
        </div>
      </LuxurySection>

      {/* Featured Collection */}
      <LuxurySection id="featured" variant="dark">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">مختارات حصريـة</h2>
            <p className="text-gray-400 max-w-2xl">أحدث القطع المضافة إلى مجموعتنا، تم اختيارها بعناية لتناسب أناقتك.</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-transparent text-gray-400 hover:text-white border border-border/50 hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-32 flex justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-32 text-center text-gray-500">
              لا توجد منتجات مطابقة للبحث في الوقت الحالي.
            </div>
          ) : (
            filteredProducts.slice(0, 8).map((product: any) => (
              <LuxuryProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={() => console.log('View details for', product.id)}
              />
            ))
          )}
        </div>
        
        <div className="mt-16 text-center">
          <LuxuryButton variant="outline" size="lg" className="px-12">
            عرض كل المنتجات
          </LuxuryButton>
        </div>
      </LuxurySection>

      {/* Trust / Brand Story */}
      <LuxurySection id="about" className="py-32 bg-background relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-primary/5 blur-[100px] pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              لماذا تختار <br/> <span className="text-primary">الماسة للمجوهرات؟</span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              نلتزم في الماسة بتقديم أعلى معايير الجودة والمصداقية. كل قطعة في مجموعتنا تعكس براعة الصياغة والتزامنا بالتميز منذ تأسيسنا.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              <div className="flex flex-col gap-3">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-bold text-white">جودة معتمدة</h4>
                <p className="text-sm text-gray-500">جميع مشغولاتنا مدموغة ومختبرة لضمان عيار الذهب ونقائه.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Gem className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-bold text-white">تصميمات حصرية</h4>
                <p className="text-sm text-gray-500">مجموعات فريدة تجمع بين الأصالة والحداثة لإرضاء كل الأذواق.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Award className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-bold text-white">أسعار شفافة</h4>
                <p className="text-sm text-gray-500">تسعير عادل مبني على أسعار السوق العالمية للذهب بشكل لحظي.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <h4 className="text-xl font-bold text-white">خدمة متميزة</h4>
                <p className="text-sm text-gray-500">فريقنا مستعد دائماً لمساعدتك في اختيار القطعة الأنسب لك.</p>
              </div>
            </div>
          </div>
          
          <div className="relative aspect-square lg:aspect-[4/5] rounded-sm overflow-hidden border border-border/30">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('/images/jewelry/hero/hero-bg.jpg')` }}
            />
          </div>
        </div>
      </LuxurySection>

    </div>
  );
}
