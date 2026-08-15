import * as React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LuxuryCategoryCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  category: {
    name: string;
    imageUrl: string;
    href: string;
  };
}

export function LuxuryCategoryCard({ category, className, ...props }: LuxuryCategoryCardProps) {
  return (
    <Link 
      href={category.href}
      className={cn(
        "group relative flex items-center justify-center overflow-hidden rounded-sm bg-card aspect-[4/5] cursor-pointer",
        className
      )}
      {...props}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
        style={{ backgroundImage: `url('${category.imageUrl}')` }}
      />
      
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/20 transition-opacity duration-500 group-hover:opacity-80" />
      
      <div className="relative z-10 flex flex-col items-center justify-end h-full w-full p-6 text-center">
        <h3 className="text-2xl font-bold text-white tracking-wide mb-2">
          {category.name}
        </h3>
        <div className="w-12 h-0.5 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      </div>
    </Link>
  )
}
