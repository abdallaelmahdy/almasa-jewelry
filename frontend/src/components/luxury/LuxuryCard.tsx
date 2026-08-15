import * as React from "react"
import { cn } from "@/lib/utils"

const LuxuryCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-sm border border-border bg-card text-card-foreground shadow-sm transition-all duration-500",
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
    className={cn("flex flex-col space-y-1.5 p-6", className)}
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
      "text-2xl font-semibold leading-none tracking-tight",
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
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
LuxuryCardDescription.displayName = "LuxuryCardDescription"

const LuxuryCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
LuxuryCardContent.displayName = "LuxuryCardContent"

const LuxuryCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
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
