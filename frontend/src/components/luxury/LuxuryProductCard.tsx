import * as React from "react"
import { cn } from "@/lib/utils"
import { ProductImageFallback } from "@/components/ui/ProductImageFallback"

interface LuxuryProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: {
    title: string;
    category: string;
    price?: string;
    weight?: string;
    karat?: string | number;
    imageUrl: string;
    status?: string;
  };
  large?: boolean;
  onViewDetails?: () => void;
}

export function LuxuryProductCard({ product, className, large = false, onViewDetails, ...props }: LuxuryProductCardProps) {
  return (
    <div 
      className={cn(
        "group relative flex flex-col w-full cursor-pointer",
        className
      )}
      onClick={onViewDetails}
      {...props}
    >
      <div className={cn(
        "relative w-full overflow-hidden bg-secondary/20",
        large ? "aspect-[3/4]" : "aspect-[4/5]"
      )}>
        <ProductImageFallback
          src={product.imageUrl}
          category={product.category}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700 pointer-events-none" />
      </div>
      
      <div className="pt-6 flex flex-col w-full">
        <div className="flex justify-between items-start gap-4">
          <div>
            {/* Category / Karat Eyebrow */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-luxury-wide text-muted-foreground">{product.category}</span>
              {product.karat && (
                <>
                  <span className="w-1 h-px bg-border"></span>
                  <span className="text-[10px] uppercase tracking-luxury-wide text-primary/80">عيار {product.karat}</span>
                </>
              )}
            </div>
            {/* Title */}
            <h3 className={cn(
              "font-display text-white transition-colors duration-500 group-hover:text-primary",
              large ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
            )}>
              {product.title}
            </h3>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-white/5 pt-4">
          <div className="flex flex-col gap-1">
            <span className="font-numeric text-primary text-sm tracking-widest">{product.price || "حسب السعر اليومي"}</span>
            {product.weight && (
              <span className="font-numeric text-xs text-muted-foreground tracking-widest">{product.weight}G</span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-sans tracking-luxury text-white opacity-0 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
              استكشف
            </span>
            <div className="w-0 h-px bg-white group-hover:w-8 transition-all duration-700 delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
