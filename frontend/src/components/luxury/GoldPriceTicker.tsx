"use client"

import * as React from "react"
import { useGoldPrice } from "@/hooks/usePOS"
import { TrendingUp, Activity } from "lucide-react"

export function GoldPriceTicker() {
  const { data: price21, isLoading: loading21 } = useGoldPrice(21)
  const { data: price24, isLoading: loading24 } = useGoldPrice(24)
  const { data: price18, isLoading: loading18 } = useGoldPrice(18)

  return (
    <div className="w-full bg-[#0d0d0d] border-b border-y border-border/30 overflow-hidden relative">
      {/* Subtle glow effect */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-full bg-primary/5 blur-3xl rounded-full" />
      
      <div className="container relative z-10 mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 text-white">
          <div className="bg-primary/20 p-2 rounded-full">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span className="block text-sm font-bold tracking-wide">مؤشر الذهب</span>
            <span className="block text-xs text-gray-400">تحديث مباشر للأسعار</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          
          {/* 24K */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">عيار 24</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {loading24 ? "---" : price24?.price_per_gram ? Number(price24.price_per_gram).toLocaleString() : "---"}
              </span>
              <span className="text-xs text-primary">ج.م</span>
            </div>
          </div>

          {/* 21K */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">عيار 21 (الأكثر مبيعاً)</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {loading21 ? "---" : price21?.price_per_gram ? Number(price21.price_per_gram).toLocaleString() : "---"}
              </span>
              <span className="text-xs text-primary">ج.م</span>
              <TrendingUp className="w-3 h-3 text-green-500 ml-1" />
            </div>
          </div>

          {/* 18K */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">عيار 18</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">
                {loading18 ? "---" : price18?.price_per_gram ? Number(price18.price_per_gram).toLocaleString() : "---"}
              </span>
              <span className="text-xs text-primary">ج.م</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
