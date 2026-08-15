"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ProductImageFallback } from "@/components/ui/ProductImageFallback"
import { X, ArrowLeft } from "lucide-react"
import { useGoldPrice } from "@/hooks/usePOS"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProductQuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string | number
    title: string
    category: string
    weight?: string
    karat?: number
    imageUrl: string
  } | null
}

export function ProductQuickViewModal({ isOpen, onClose, product }: ProductQuickViewModalProps) {
  const { data: goldPrice } = useGoldPrice(product?.karat || 21)

  if (!product) return null

  // Calculate live price if weight and gold price are available
  const weightVal = parseFloat(product.weight || "0")
  const priceVal = parseFloat(goldPrice?.price_per_gram || "0")
  let displayPrice = "حسب السعر اليومي"
  if (weightVal > 0 && priceVal > 0) {
    const total = weightVal * priceVal
    displayPrice = total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " EGP"
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 bg-background border border-white/10 shadow-2xl overflow-hidden rounded-none [&>button]:hidden">
        <DialogTitle className="sr-only">تفاصيل المنتج: {product.title}</DialogTitle>
        
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Image Section */}
          <div className="w-full md:w-1/2 relative bg-secondary/10 min-h-[300px] md:min-h-0">
            <ProductImageFallback
              src={product.imageUrl}
              category={product.category}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 md:right-6 md:top-6 p-2 text-white/50 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 mt-4 md:mt-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-sans text-[10px] uppercase tracking-luxury-wide text-primary">
                  {product.category}
                </span>
                {product.karat && (
                  <>
                    <span className="w-1 h-px bg-white/20"></span>
                    <span className="font-sans text-[10px] uppercase tracking-luxury-wide text-white/60">
                      عيار {product.karat}
                    </span>
                  </>
                )}
              </div>

              <h2 className="font-display text-3xl md:text-4xl text-white mb-6 leading-tight">
                {product.title}
              </h2>

              <div className="space-y-6 border-t border-white/5 pt-6 mt-6">
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-[10px] uppercase tracking-luxury text-white/40">السعر التقديري</span>
                  <span className="font-numeric text-2xl tracking-widest text-white">
                    {displayPrice}
                  </span>
                </div>
                
                {product.weight && (
                  <div className="flex flex-col gap-1">
                    <span className="font-sans text-[10px] uppercase tracking-luxury text-white/40">الوزن</span>
                    <span className="font-numeric text-lg tracking-widest text-white/80">
                      {product.weight}G
                    </span>
                  </div>
                )}
                
                <div className="flex flex-col gap-1">
                  <span className="font-sans text-[10px] uppercase tracking-luxury text-white/40">التوفر</span>
                  <span className="font-sans text-sm text-green-400">متوفر في المعرض</span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-white/5">
              <Link
                href="/#contact"
                onClick={onClose}
                className="flex items-center justify-between w-full p-4 bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 group"
              >
                <span className="font-sans text-xs font-bold uppercase tracking-luxury">تواصل معنا للحجز</span>
                <ArrowLeft className="w-4 h-4 rtl:-scale-x-100 group-hover:-translate-x-2 transition-transform duration-500" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
