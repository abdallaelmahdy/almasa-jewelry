"use client"

import { useState } from "react"

const tabs = ["الكل", "خواتم", "أساور", "قلائد", "أطقم", "الطقم"]

export function CategoryTabs() {
  const [active, setActive] = useState("الطقم")

  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-white/5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            active === tab ? "text-gold" : "text-white/45 hover:text-white/70"
          }`}
        >
          {tab}
          {active === tab && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gold" />
          )}
        </button>
      ))}
    </div>
  )
}
