import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImageFallbackProps {
  src?: string | null;
  alt: string;
  category?: string;
  className?: string;
  fallbackClassName?: string;
}

export function ProductImageFallback({
  src,
  alt,
  category,
  className,
  fallbackClassName,
}: ProductImageFallbackProps) {
  const [error, setError] = useState(false);

  // Use reliable Unsplash placeholders based on category if no src is provided or image errors out
  const getPlaceholder = (cat?: string) => {
    switch (cat) {
      case "خواتم":
      case "Rings":
        return "https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=600";
      case "سلاسل":
      case "Necklaces":
        return "https://images.unsplash.com/photo-1599643478524-fb52445cbf31?auto=format&fit=crop&q=80&w=600";
      case "حلقان":
      case "Earrings":
        return "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600";
      case "غوايش":
      case "Bracelets":
        // Bracelet placeholder
        return "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600";
      default:
        // Generic jewelry placeholder
        return "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600";
    }
  };

  const finalSrc = error || !src ? getPlaceholder(category) : src;

  return (
    <div className={cn("relative overflow-hidden bg-background/50", className)}>
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          "object-cover transition-transform duration-500 hover:scale-110",
          error && !src ? "opacity-70 grayscale" : ""
        )}
        onError={() => setError(true)}
      />
    </div>
  );
}
