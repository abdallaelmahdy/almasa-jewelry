"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GoldPriceTicker } from "@/components/luxury/GoldPriceTicker";
import { LuxuryProductCard } from "@/components/luxury/LuxuryProductCard";
import { ProductQuickViewModal } from "@/components/luxury/ProductQuickViewModal";
import { ArrowLeft, Search, Filter, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Fallback images if real ones are missing
const FALLBACK_IMAGES: Record<string, string> = {
  "خواتم": "/images/jewelry/rings/ring-01.jpg",
  "سلاسل": "/images/jewelry/necklaces/necklace-02.jpg",
  "أساور": "/images/jewelry/bracelets/bracelet-01.jpg",
  "حلقان": "/images/jewelry/earrings/earrings-01.jpg",
  "سبائك": "/images/jewelry/bullion/bullion-01.jpg",
  "أخرى": "/images/jewelry/necklaces/necklace-02.jpg"
};

const CATEGORIES = ["الكل", "خواتم", "سلاسل", "أساور", "حلقان", "سبائك", "أطقم"];

export default function PublicHomepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: rawInventory, isLoading, isError } = useQuery({
    queryKey: ["public_inventory", activeCategory, searchQuery],
    queryFn: async () => {
      // If we select a specific category, pass it. The backend currently matches on category_name
      const params: Record<string, any> = { limit: 100 };
      if (activeCategory !== "الكل") params.category_name = activeCategory;
      if (searchQuery.trim().length > 0) params.search = searchQuery;
      
      const { data } = await api.get("/public_catalog/inventory", { params });
      return data;
    },
    // We don't need to refetch on window focus for public catalog
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  // Map to the format needed by LuxuryProductCard
  const products = useMemo(() => {
    if (!rawInventory) return [];
    return rawInventory.map((item: any) => ({
      id: item.id,
      title: item.product.name,
      category: item.product.category.name,
      price: "حسب السعر اليومي", // Live calculated in the modal
      weight: item.weight,
      karat: item.karat,
      imageUrl: FALLBACK_IMAGES[item.product.category.name] || FALLBACK_IMAGES["أخرى"],
      rawItem: item
    }));
  }, [rawInventory]);

  // Featured for the editorial section
  const featuredProducts = products.slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The query automatically refetches because of useQuery dependencies
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* 01 — IMMERSIVE HERO */}
      <section className="relative h-screen w-full flex items-end justify-center pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-in fade-in duration-1000 zoom-in-95"
          style={{ backgroundImage: `url('/images/jewelry/hero/hero-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="relative z-10 text-center space-y-6 max-w-4xl px-4 animate-in slide-in-from-bottom-8 duration-1000 fade-in delay-300">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white tracking-normal font-bold">
            الماسة
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/80 font-light tracking-wide max-w-2xl mx-auto">
            حيث يلتقي بريق الذهب ببراعة التصميم لتراث يمتد عبر الأجيال.
          </p>
          <div className="pt-8">
            <button 
              onClick={() => document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-luxury text-white hover:text-primary transition-colors duration-500 pb-1 border-b border-white/30 hover:border-primary cursor-pointer"
            >
              اكتشف التشكيلة
            </button>
          </div>
        </div>
      </section>

      {/* 02 — GOLD MARKET / LIVE PRICE */}
      <GoldPriceTicker />

      {/* 03 — BRAND INTRODUCTION */}
      <section id="heritage" className="py-32 md:py-48 px-6 lg:px-16 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="order-2 lg:order-1 space-y-10">
            <span className="font-sans text-xs uppercase tracking-luxury-wide text-muted-foreground">تراث الماسة</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-[1.3]">
              نصنع قطعاً لا تُشترى فقط، <br/>
              <span className="text-primary italic">بل تُورّث.</span>
            </h2>
            <div className="space-y-6 text-muted-foreground font-sans text-lg leading-relaxed max-w-lg font-light">
              <p>
                نلتزم في الماسة بتقديم أعلى معايير الجودة والمصداقية. كل قطعة في مجموعتنا تعكس براعة الصياغة والتزامنا بالتميز منذ تأسيسنا.
              </p>
              <p>
                نحن لا نبيع الذهب فحسب، بل نصوغ حكايات تليق بمن يقتنيها، وترافقهم في أجمل لحظات حياتهم.
              </p>
            </div>
            <div className="pt-4">
              <button 
                onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 text-sm font-sans tracking-luxury text-white hover:text-primary transition-colors duration-500 group cursor-pointer"
              >
                <span>تصفح الكتالوج</span>
                <ArrowLeft className="w-4 h-4 rtl:-scale-x-100 group-hover:-translate-x-2 transition-transform duration-500" />
              </button>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative aspect-[3/4] overflow-hidden w-full max-w-md mx-auto lg:max-w-none lg:mr-auto">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
              style={{ backgroundImage: `url('/images/jewelry/hero/hero-bg.jpg')` }}
            />
          </div>
        </div>
      </section>

      {/* 04 — SIGNATURE COLLECTIONS */}
      <section id="collections" className="w-full flex flex-col py-32 bg-background">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-16 w-full mb-16">
          <span className="font-sans text-[10px] uppercase tracking-luxury-wide text-primary mb-4 block">المجموعات الحصرية</span>
          <h2 className="font-display text-4xl md:text-5xl text-white font-light tracking-wide">تصاميم تأسر الحواس</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 lg:h-[800px] max-w-[1920px] mx-auto w-full">
          {/* Large Hero Collection (Rings) */}
          <button 
            onClick={() => {
              setActiveCategory("خواتم");
              document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative lg:col-span-7 h-[50vh] lg:h-full overflow-hidden block text-right"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[2s] ease-out group-hover:scale-105"
              style={{ backgroundImage: `url('/images/jewelry/rings/ring-01.jpg')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-1000" />
            <div className="absolute bottom-0 left-0 right-0 p-10 md:p-16 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-1000 ease-out">
              <span className="text-[10px] font-sans tracking-luxury-wide text-primary mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200 uppercase">بريق لا يُنسى</span>
              <h3 className="font-display text-4xl md:text-6xl text-white font-light tracking-wide">الخواتم الماسية</h3>
            </div>
          </button>

          <div className="lg:col-span-5 grid grid-rows-2 gap-1 h-[100vh] lg:h-full">
            {/* Top Right Collection */}
            <button 
              onClick={() => {
                setActiveCategory("أطقم");
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative h-full overflow-hidden block text-right"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[2s] ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('/images/jewelry/necklaces/necklace-02.jpg')` }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-1000" />
              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-1000 ease-out">
                <span className="text-[10px] font-sans tracking-luxury-wide text-primary/80 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 uppercase">ليلة العمر</span>
                <h3 className="font-display text-3xl text-white font-light">أطقم الزفاف</h3>
              </div>
            </button>

            {/* Bottom Right Collection */}
            <button 
              onClick={() => {
                setActiveCategory("أساور");
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative h-full overflow-hidden block text-right"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[2s] ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('/images/jewelry/bracelets/bracelet-01.jpg')` }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-1000" />
              <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-1000 ease-out">
                <span className="text-[10px] font-sans tracking-luxury-wide text-primary/80 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 uppercase">أناقة يومية</span>
                <h3 className="font-display text-3xl text-white font-light">أساور لازوردي</h3>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 05 — PRODUCT DISCOVERY / CATALOG */}
      <section id="shop" className="py-32 px-6 lg:px-16 max-w-[1600px] mx-auto w-full min-h-screen">
        <div className="flex flex-col space-y-12 mb-16">
          <div className="text-center space-y-4">
            <span className="font-sans text-xs uppercase tracking-luxury-wide text-muted-foreground block">اكتشف</span>
            <h2 className="font-display text-4xl md:text-5xl text-white">الكتالوج الكامل</h2>
          </div>

          {/* Discovery Controls */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 border-y border-white/10 py-6">
            
            {/* Category Filters */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 w-full lg:w-auto">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "font-sans text-sm uppercase tracking-luxury transition-all duration-300 pb-1 border-b",
                    activeCategory === cat 
                      ? "text-primary border-primary" 
                      : "text-white/50 border-transparent hover:text-white hover:border-white/30"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96 flex">
              <input 
                type="text" 
                placeholder="ابحث عن قطعة (مثال: خاتم، ذهب عيار 21)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/10 border border-white/10 text-white font-sans text-sm px-4 py-3 focus:outline-none focus:border-primary/50 transition-colors pr-12"
              />
              <button 
                type="submit" 
                className="absolute right-0 top-0 bottom-0 px-4 text-white/50 hover:text-primary transition-colors flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery("")}
                  className="absolute left-0 top-0 bottom-0 px-4 text-white/30 hover:text-white transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Discovery Results */}
        {isLoading ? (
          <div className="w-full py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="font-sans text-xs uppercase tracking-luxury text-white/50">جاري التحميل...</span>
          </div>
        ) : isError ? (
          <div className="w-full py-32 flex flex-col items-center justify-center gap-4 text-white/50">
            <AlertCircle className="w-12 h-12 opacity-30 mb-2" />
            <span className="font-sans text-sm tracking-widest text-center">عذراً، حدث خطأ أثناء تحميل الكتالوج.</span>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full py-32 flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center">
              <Filter className="w-8 h-8 text-white/20" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-display text-2xl text-white">لا توجد نتائج</h3>
              <p className="font-sans text-sm text-white/50">لم نتمكن من العثور على قطع تتطابق مع بحثك.</p>
            </div>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("الكل"); }}
              className="mt-4 px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-sans text-xs uppercase tracking-luxury transition-colors border border-white/10 hover:border-white/20"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
            {products.map((product: any) => (
              <LuxuryProductCard 
                key={product.id}
                product={product} 
                onViewDetails={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 06 — FINAL CTA */}
      <section id="contact" className="relative h-[70vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/images/jewelry/rings/ring-01.jpg')` }}
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        
        <div className="relative z-10 text-center space-y-8 p-6">
          <h2 className="font-display text-4xl md:text-6xl text-white font-bold">هل أنت مستعد لاختيار قطعتك؟</h2>
          <p className="font-sans text-white/70 max-w-xl mx-auto text-lg font-light">
            تفضل بزيارة معرضنا في القاهرة لتجربة التشكيلة شخصياً.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="tel:+201234567890" className="flex flex-col gap-2 border border-white/20 p-6 bg-black/20 backdrop-blur-md min-w-[250px] hover:bg-white/10 transition-colors cursor-pointer group">
              <span className="font-sans text-xs text-white/50 uppercase tracking-luxury group-hover:text-white transition-colors">الهاتف</span>
              <span className="font-numeric text-xl tracking-widest text-white" dir="ltr">+20 123 456 7890</span>
            </a>
            <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2 border border-primary/40 p-6 bg-primary/5 backdrop-blur-md min-w-[250px] hover:bg-primary/20 transition-colors cursor-pointer group">
              <span className="font-sans text-xs text-primary uppercase tracking-luxury group-hover:text-white transition-colors">واتساب</span>
              <span className="font-sans text-lg text-white font-medium" dir="ltr">تواصل معنا</span>
            </a>
            <div className="flex flex-col gap-2 border border-white/20 p-6 bg-black/20 backdrop-blur-md min-w-[250px]">
              <span className="font-sans text-xs text-white/50 uppercase tracking-luxury">المعرض</span>
              <span className="font-sans text-lg text-white font-medium">وسط البلد، القاهرة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Quick View Modal */}
      <ProductQuickViewModal 
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
      />

    </div>
  );
}
