import * as React from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VariantProps } from "class-variance-authority"

export interface LuxuryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const LuxuryButton = React.forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <Button
        className={cn(
          "transition-all duration-500 font-bold tracking-wide",
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20",
          variant === "outline" && "border-primary/50 text-primary hover:bg-primary/10 hover:border-primary bg-transparent",
          variant === "ghost" && "hover:bg-primary/10 hover:text-primary",
          className
        )}
        variant={variant}
        size={size}
        ref={ref}
        {...props}
      />
    )
  }
)
LuxuryButton.displayName = "LuxuryButton"

export { LuxuryButton }
