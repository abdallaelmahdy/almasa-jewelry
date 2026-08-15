"use client"

import * as React from "react"
import { useGoldPrice } from "@/hooks/usePOS"

export function GoldPriceTicker() {
  const { data: price21, isLoading: loading21 } = useGoldPrice(21)
  const { data: price24, isLoading: loading24 } = useGoldPrice(24)
  const { data: price18, isLoading: loading18 } = useGoldPrice(18)

  return (
    <div className="w-full bg-[#0a0a0a] border-y border-white/5 py-8">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Title Area */}
        <div className="flex flex-col items-center md:items-start border-b md:border-b-0 md:border-l border-white/10 pb-6 md:pb-0 md:pl-12 w-full md:w-auto">
          <span className="font-sans text-xs uppercase tracking-luxury-wide text-muted-foreground mb-1">المؤشر المباشر</span>
          <span className="font-display text-xl text-white">سوق الذهب</span>
        </div>

        {/* Prices Area */}
        <div className="flex flex-1 w-full justify-between sm:justify-around items-center">
          
          {/* 24K */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-sans text-[10px] uppercase tracking-luxury-wide text-primary/70">عيار 24</span>
            <div className="flex items-baseline gap-1">
              <span className="font-numeric text-xl md:text-2xl text-white tracking-widest">
                {loading24 ? "---" : price24?.price_per_gram ? Number(price24.price_per_gram).toLocaleString() : "---"}
              </span>
              <span className="font-sans text-xs text-muted-foreground">EGP</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/5 hidden sm:block"></div>

          {/* 21K */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-sans text-[10px] uppercase tracking-luxury-wide text-primary">عيار 21</span>
            <div className="flex items-baseline gap-1">
              <span className="font-numeric text-xl md:text-2xl text-white tracking-widest">
                {loading21 ? "---" : price21?.price_per_gram ? Number(price21.price_per_gram).toLocaleString() : "---"}
              </span>
              <span className="font-sans text-xs text-muted-foreground">EGP</span>
            </div>
          </div>

          <div className="w-px h-8 bg-white/5 hidden sm:block"></div>

          {/* 18K */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-sans text-[10px] uppercase tracking-luxury-wide text-primary/70">عيار 18</span>
            <div className="flex items-baseline gap-1">
              <span className="font-numeric text-xl md:text-2xl text-white tracking-widest">
                {loading18 ? "---" : price18?.price_per_gram ? Number(price18.price_per_gram).toLocaleString() : "---"}
              </span>
              <span className="font-sans text-xs text-muted-foreground">EGP</span>
            </div>
          </div>

        </div>
        
        {/* Timestamp / Status */}
        <div className="hidden lg:flex flex-col items-end border-r border-white/10 pr-12 w-auto">
          <span className="font-sans text-[10px] uppercase tracking-luxury-wide text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500/80 animate-pulse"></span>
            تحديث لحظي
          </span>
          <span className="font-numeric text-xs text-white/50 mt-1 tracking-widest">
            {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

      </div>
    </div>
  )
}
