import Image from "next/image"

type Product = {
  name: string
  spec: string
  price: string
  image: string
}

const products: Product[] = [
  {
    name: "خاتم ماسة",
    spec: "عيار 21 - 31 جرام",
    price: "8,050",
    image: "/products/diamond-ring.png",
  },
  {
    name: "غويشة ذهب",
    spec: "عيار 21 - 21 جرام",
    price: "35,000",
    image: "/products/gold-band.png",
  },
  {
    name: "سلسال ذهب",
    spec: "عيار 18 - 4.8 جرام",
    price: "9,300",
    image: "/products/gold-necklace.png",
  },
  {
    name: "حلقان ذهب",
    spec: "عيار 21 - 21 جرام",
    price: "6,200",
    image: "/products/gold-earrings.png",
  },
]

export function ProductGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((product) => (
        <article
          key={product.name}
          className="overflow-hidden rounded-2xl border border-white/5 bg-card transition-colors hover:border-gold/30"
        >
          <div className="relative aspect-square bg-black">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="p-4 text-center">
            <h3 className="text-base font-bold text-white">{product.name}</h3>
            <p className="mt-1 text-xs text-white/45">{product.spec}</p>
            <p className="mt-3 text-lg font-bold text-gold">{product.price}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
