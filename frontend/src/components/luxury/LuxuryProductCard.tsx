import * as React from "react"
import { cn } from "@/lib/utils"
import { ProductImageFallback } from "@/components/ui/ProductImageFallback"

interface LuxuryProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: {
    title: string;
    category: string;
    price?: string;
    weight?: string;
    karat?: string;
    imageUrl: string;
    status?: string;
  };
  onViewDetails?: () => void;
}

export function LuxuryProductCard({ product, className, onViewDetails, ...props }: LuxuryProductCardProps) {
  return (
    <div 
      className={cn(
        "group relative flex flex-col bg-card rounded-md overflow-hidden border border-border/50 transition-all duration-700 hover:border-primary/40 hover:shadow-2xl hover:shadow-black/50 cursor-pointer",
        className
      )}
      onClick={onViewDetails}
      {...props}
    >
      <div className="aspect-[4/5] relative w-full overflow-hidden bg-secondary/50">
        <ProductImageFallback
          src={product.imageUrl}
          category={product.category}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Status / Karat Badge */}
        {product.karat && (
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-sm border border-primary/20">
            <span className="text-xs font-medium text-primary tracking-wide">عيار {product.karat}</span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h3>
          {product.weight && (
            <p className="text-sm text-muted-foreground mt-1 tracking-wide">{product.weight} جرام</p>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-border/30 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">السعر</span>
            <span className="text-base font-bold text-primary">{product.price || "حسب السعر اليومي"}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium text-foreground">
            عرض التفاصيل ←
          </div>
        </div>
      </div>
    </div>
  )
}
