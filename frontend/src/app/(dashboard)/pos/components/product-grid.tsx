"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

export type ProductCardData = {
  id: string;
  name: string;
  spec: string;
  price: string;
  image: string;
  inCart: boolean;
  isLocking: boolean;
};

export function ProductGrid({
  products,
  onProductClick,
}: {
  products: ProductCardData[];
  onProductClick: (id: string) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-white/30 text-sm">
        لا توجد منتجات متاحة
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <article
          key={product.id}
          onClick={() => !product.inCart && !product.isLocking && onProductClick(product.id)}
          className={`overflow-hidden rounded-2xl border bg-card transition-colors cursor-pointer relative group ${
            product.inCart
              ? "border-gold/40 ring-1 ring-gold/20"
              : "border-white/5 hover:border-gold/30"
          }`}
        >
          <div className="relative aspect-square bg-black">
            {product.isLocking && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-gold" />
              </div>
            )}
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 25vw"
              className={`object-cover transition-opacity ${product.isLocking ? 'opacity-50' : 'opacity-80 group-hover:opacity-100'}`}
            />
            {product.inCart && (
              <div className="absolute top-2 start-2 bg-gold text-black text-[10px] font-bold px-2 py-0.5 rounded z-10">
                في السلة
              </div>
            )}
          </div>
          <div className="p-4 text-center">
            <h3 className="text-base font-bold text-white">{product.name}</h3>
            <p className="mt-1 text-xs text-white/45">{product.spec}</p>
            <p className="mt-3 text-lg font-bold text-gold">{product.price}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
