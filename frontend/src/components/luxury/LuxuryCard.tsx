import * as React from "react"
import { cn } from "@/lib/utils"

const LuxuryCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border border-white/5 bg-white/[0.01] text-white shadow-none transition-all duration-500 hover:border-white/10 relative overflow-hidden group",
      className
    )}
    {...props}
  />
))
LuxuryCard.displayName = "LuxuryCard"

const LuxuryCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4 relative z-10", className)}
    {...props}
  />
))
LuxuryCardHeader.displayName = "LuxuryCardHeader"

const LuxuryCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-sans text-[11px] uppercase tracking-luxury text-white/60 leading-none",
      className
    )}
    {...props}
  />
))
LuxuryCardTitle.displayName = "LuxuryCardTitle"

const LuxuryCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs font-sans text-muted-foreground mt-2", className)}
    {...props}
  />
))
LuxuryCardDescription.displayName = "LuxuryCardDescription"

const LuxuryCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
))
LuxuryCardContent.displayName = "LuxuryCardContent"

const LuxuryCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 border-t border-white/5 mt-4 relative z-10", className)}
    {...props}
  />
))
LuxuryCardFooter.displayName = "LuxuryCardFooter"

export {
  LuxuryCard,
  LuxuryCardHeader,
  LuxuryCardFooter,
  LuxuryCardTitle,
  LuxuryCardDescription,
  LuxuryCardContent,
}
