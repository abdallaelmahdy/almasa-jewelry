import * as React from "react"
import { cn } from "@/lib/utils"

export interface LuxurySectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "dark" | "gradient" | "cinematic"
  cinematicImageUrl?: string
}

const LuxurySection = React.forwardRef<HTMLElement, LuxurySectionProps>(
  ({ className, variant = "default", cinematicImageUrl, children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "relative py-24 md:py-32",
          variant === "default" && "bg-background text-foreground",
          variant === "dark" && "bg-secondary text-secondary-foreground",
          variant === "gradient" && "bg-gradient-to-b from-background via-secondary to-background",
          variant === "cinematic" && "flex items-center justify-center min-h-[80vh] overflow-hidden",
          className
        )}
        {...props}
      >
        {variant === "cinematic" && cinematicImageUrl && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${cinematicImageUrl}')` }}
            />
            {/* Dark luxury overlay: strong gradient from bottom, black overall tint */}
            <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent" />
          </>
        )}
        
        <div className={cn("container relative z-10", variant === "cinematic" && "text-center")}>
          {children}
        </div>
      </section>
    )
  }
)
LuxurySection.displayName = "LuxurySection"

const LuxurySectionHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("text-center max-w-3xl mx-auto mb-16 space-y-4", className)} {...props}>
      {children}
    </div>
  )
)
LuxurySectionHeader.displayName = "LuxurySectionHeader"

const LuxurySectionTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-3xl md:text-5xl font-bold tracking-tight", className)}
      {...props}
    />
  )
)
LuxurySectionTitle.displayName = "LuxurySectionTitle"

const LuxurySectionDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-lg md:text-xl text-muted-foreground", className)}
      {...props}
    />
  )
)
LuxurySectionDescription.displayName = "LuxurySectionDescription"

export { LuxurySection, LuxurySectionHeader, LuxurySectionTitle, LuxurySectionDescription }
