"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { CategoryTabs } from "./components/category-tabs";
import { ProductGrid, ProductCardData } from "./components/product-grid";
import { GoldCalculator } from "./components/gold-calculator";
import { InvoicePanel, InvoiceRowData } from "./components/invoice-panel";
import { InvoiceModal } from "@/components/pos/InvoiceModal";
import { CheckoutModal } from "@/components/pos/CheckoutModal";
import { CustomerModal } from "@/components/pos/CustomerModal";

import { useInventory, useLockInventory, useUnlockInventory } from "@/hooks/useInventory";
import { useCheckout } from "@/hooks/usePOS";
import { usePOSStore } from "@/stores/posStore";
import { GoldPriceOut } from "@/types/sales";
import { InventoryItemOut } from "@/types/inventory";

export default function POSPage() {
  // ─── Search & Category State ───
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("الكل");

  // ─── Calculator State ───
  const [calcKarat, setCalcKarat] = useState("21");
  const [calcWeight, setCalcWeight] = useState("10");
  const [calcManufacturing, setCalcManufacturing] = useState("150");

  // ─── Locking State ───
  const [lockingId, setLockingId] = useState<string | null>(null);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ─── Modals State ───
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── ALMASA Store ───
  const cartItems = usePOSStore((s) => s.cartItems);
  const cartTotal = usePOSStore((s) => s.cartTotal);
  const goldPrices = usePOSStore((s) => s.goldPrices);
  const customerId = usePOSStore((s) => s.customerId);
  const customerName = usePOSStore((s) => s.customerName);
  const payments = usePOSStore((s) => s.payments);
  const idempotencyKey = usePOSStore((s) => s.idempotencyKey);
  const completedSale = usePOSStore((s) => s.completedSale);
  const addItem = usePOSStore((s) => s.addItem);
  const removeItem = usePOSStore((s) => s.removeItem);
  const setGoldPrices = usePOSStore((s) => s.setGoldPrices);
  const setCompletedSale = usePOSStore((s) => s.setCompletedSale);

  const lockMutation = useLockInventory();
  const unlockMutation = useUnlockInventory();
  const checkoutMutation = useCheckout();

  // ─── Fetch ALMASA Inventory ───
  const { data: inventoryItems } = useInventory({
    status: "AVAILABLE",
    limit: 100, 
  });

  // ─── Fetch Gold Prices ───
  const { data: recentPrices } = useQuery({
    queryKey: ["recentGoldPrices"],
    queryFn: async () => {
      const { data } = await api.get<GoldPriceOut[]>("/gold-prices", {
        params: { limit: 20 },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (recentPrices) {
      const pricesDict: Record<number, number> = {};
      recentPrices.forEach((p) => {
        pricesDict[p.karat] = parseFloat(p.price_per_gram.toString());
      });
      setGoldPrices(pricesDict);
    }
  }, [recentPrices, setGoldPrices]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Derived Categories ───
  const dynamicCategories = useMemo(() => {
    if (!inventoryItems) return ["الكل"];
    const cats = new Set<string>();
    inventoryItems.forEach((item) => {
      if (item.product?.category?.name) {
        cats.add(item.product.category.name);
      }
    });
    return ["الكل", ...Array.from(cats)];
  }, [inventoryItems]);

  // ─── Filtered Products for Grid ───
  const productCards: ProductCardData[] = useMemo(() => {
    if (!inventoryItems) return [];
    
    let filtered = inventoryItems;
    if (activeTab !== "الكل") {
      filtered = filtered.filter((item) => item.product?.category?.name === activeTab);
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.product?.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
      );
    }

    return filtered.map((item) => {
      const pricePerGram = goldPrices[item.karat] || 0;
      const total = pricePerGram * parseFloat(item.weight) + parseFloat(item.manufacturing_fee);
      
      return {
        id: item.id,
        name: item.product.name,
        spec: `عيار ${item.karat} - ${item.weight} جرام`,
        price: pricePerGram ? total.toLocaleString("ar-EG", { maximumFractionDigits: 0 }) : "—",
        image: item.product.image_url || "",
        inCart: cartItems.some((c) => c.id === item.id),
        isLocking: lockingId === item.id || unlockingId === item.id,
      };
    });
  }, [inventoryItems, activeTab, debouncedQuery, goldPrices, cartItems, lockingId, unlockingId]);

  // ─── Calculate Values for Gold Calculator ───
  const calcGoldPriceValue = goldPrices[Number(calcKarat)] || 0;
  const calcEstimate = calcGoldPriceValue * parseFloat(calcWeight || "0") + parseFloat(calcManufacturing || "0");
  const formattedGoldPrice = calcGoldPriceValue ? calcGoldPriceValue.toLocaleString("ar-EG") : "—";
  const formattedEstimate = calcGoldPriceValue > 0 ? calcEstimate.toLocaleString("ar-EG", { maximumFractionDigits: 0 }) : "—";

  // ─── Map Cart to Invoice Rows ───
  const invoiceRows: InvoiceRowData[] = cartItems.map((item) => {
    const p = goldPrices[item.karat] || 0;
    const lineTotal = p * parseFloat(item.weight) + parseFloat(item.manufacturing_fee);
    return {
      id: item.id,
      name: item.product.name,
      weight: item.weight,
      qty: "1", // ALMASA items are unique physical pieces
      gram: p ? p.toLocaleString("ar-EG") : "—",
      craft: item.manufacturing_fee,
      total: p ? lineTotal.toLocaleString("ar-EG", { maximumFractionDigits: 2 }) : "—",
    };
  });

  const totalManufacturing = cartItems.reduce((sum, i) => sum + parseFloat(i.manufacturing_fee), 0);
  const formattedSubTotal = cartTotal > 0 ? cartTotal.toLocaleString("ar-EG", { maximumFractionDigits: 2 }) : "—";
  const formattedCraftTotal = totalManufacturing.toLocaleString("ar-EG", { maximumFractionDigits: 2 });
  const formattedFinalTotal = cartTotal > 0 ? cartTotal.toLocaleString("ar-EG", { maximumFractionDigits: 2 }) : "—";

  // ─── Handlers ───
  const handleAddProduct = async (id: string) => {
    const item = inventoryItems?.find(i => i.id === id);
    if (!item) return;

    setLockingId(item.id);
    setErrorMsg(null);
    try {
      const locked = await lockMutation.mutateAsync({
        id: item.id,
        payload: { reason: "POS_CHECKOUT", reference_type: "POS_CART" },
      });
      addItem(locked);
    } catch {
      setErrorMsg(`فشل حجز القطعة (${item.sku}). قد تكون محجوزة بالفعل أو غير متاحة.`);
    } finally {
      setLockingId(null);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setUnlockingId(id);
    setErrorMsg(null);
    try {
      await unlockMutation.mutateAsync({
        id,
        payload: { reason: "MANUAL_UNLOCK" },
      });
      removeItem(id);
    } catch {
      setErrorMsg("فشل إزالة القطعة من السلة. يرجى المحاولة مرة أخرى.");
    } finally {
      setUnlockingId(null);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0 || payments.length === 0) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const sale = await checkoutMutation.mutateAsync({
        inventory_item_ids: cartItems.map((i) => i.id),
        customer_id: customerId,
        payments, 
        idempotency_key: idempotencyKey,
      });
      setCompletedSale(sale);
      setIsCheckoutModalOpen(false);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.detail || "فشل إتمام عملية البيع. يرجى مراجعة المدفوعات والمحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col relative">
      {/* Global POS Error Banner */}
      {errorMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg shadow-lg text-sm flex items-center justify-between gap-4">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400/50 hover:text-red-400">&times;</button>
        </div>
      )}

      <main className="flex-1 px-5 py-5 overflow-y-auto" dir="rtl">
        <h1 className="mb-5 text-2xl font-bold text-white">نقطة البيع</h1>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-stretch h-[calc(100%-3rem)]">
          {/* Column 1 — Products (40%) */}
          <div className="flex flex-col xl:w-2/5 min-h-0">
            <div className="relative shrink-0">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#151515] py-2.5 pr-10 pl-4 text-sm text-white/80 placeholder:text-white/40 focus:border-gold/50 focus:outline-none"
              />
            </div>

            <div className="mt-5 shrink-0">
              <CategoryTabs 
                tabs={dynamicCategories} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
              />
            </div>

            <div className="mt-5 flex-1 overflow-y-auto">
              <ProductGrid 
                products={productCards} 
                onProductClick={handleAddProduct} 
              />
            </div>
          </div>

          {/* Column 2 — Gold Calculator (30%) */}
          <div className="xl:w-[30%] shrink-0">
            <GoldCalculator 
              karat={calcKarat}
              setKarat={setCalcKarat}
              weight={calcWeight}
              setWeight={setCalcWeight}
              manufacturing={calcManufacturing}
              setManufacturing={setCalcManufacturing}
              goldPrice={formattedGoldPrice}
              finalPrice={formattedEstimate}
            />
          </div>

          {/* Column 3 — Invoice (30%) */}
          <div className="xl:w-[30%] min-h-0 flex flex-col">
            <InvoicePanel 
              invoiceNumber="—"
              customerName={customerName || "—"}
              customerPhone="—"
              date={new Date().toISOString().split("T")[0]}
              totalItems={cartItems.length.toString()}
              rows={invoiceRows}
              subTotal={formattedSubTotal}
              totalManufacturing={formattedCraftTotal}
              finalTotal={formattedFinalTotal}
              onPrint={() => setIsCheckoutModalOpen(true)}
              isSubmitting={isSubmitting}
              onRemoveItem={handleRemoveItem}
              onCustomerClick={() => setIsCustomerModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
      />
      
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onCheckout={handleCheckout}
        isSubmitting={isSubmitting}
      />

      {/* ALMASA specific success modal */}
      {completedSale && completedSale.invoice && <InvoiceModal />}
    </div>
  );
}
