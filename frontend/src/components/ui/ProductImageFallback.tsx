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

  // Deterministically select an image based on the alt text string length or character sum
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const getPlaceholder = (cat?: string, altText: string = "") => {
    const hash = getHash(altText);
    let options: string[] = [];
    switch (cat) {
      case "خواتم":
      case "Rings":
        options = [
          "https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=600"
        ];
        break;
      case "سلاسل":
      case "Necklaces":
        options = [
          "https://images.unsplash.com/photo-1599643478524-fb52445cbf31?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600"
        ];
        break;
      case "حلقان":
      case "Earrings":
        options = [
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1635314785675-430c50d535ec?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=600"
        ];
        break;
      case "غوايش":
      case "أساور":
      case "Bracelets":
        options = [
          "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1573408301145-b98c4af06b8f?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&q=80&w=600"
        ];
        break;
      case "سبائك":
      case "Bullion":
        options = [
          "https://images.unsplash.com/photo-1621528657682-1c258d46db1d?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=600"
        ];
        break;
      case "أطقم":
      case "Sets":
        options = [
          "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600"
        ];
        break;
      default:
        options = [
          "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600",
          "https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80&w=600"
        ];
    }
    return options[hash % options.length];
  };

  const finalSrc = error || !src ? getPlaceholder(category, alt) : src;

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
