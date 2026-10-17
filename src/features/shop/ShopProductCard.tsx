"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/config/catalog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useCartStore } from "@/features/cart/useCartStore";
import { useWishlistStore } from "@/features/wishlist/useWishlistStore";
import { useMounted } from "@/hooks/useMounted";
import { cn, discountPercent, formatPrice } from "@/lib/utils";

/**
 * ShopProductCard — the square-tile card used on the Shop, Collections and
 * Search pages. Includes badge, wishlist heart-pop, rating, price row with
 * discount and an Add-to-Cart button that writes to the cart store.
 */
export function ShopProductCard({
  product,
  className,
  ctaLabel = "Add to Cart",
}: {
  product: Product;
  className?: string;
  /** Override the add-to-cart button label (e.g. "Personalize Now" on the PDP) */
  ctaLabel?: string;
}) {
  const [added, setAdded] = useState(false);
  const add = useCartStore((s) => s.add);
  const mounted = useMounted();
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i.id === product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  // The persisted wishlist resolves after mount — gate to avoid hydration mismatch.
  const liked = mounted && inWishlist;
  const discount = discountPercent(product.price, product.compareAt);

  function handleAdd() {
    add({
      id: product.id,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      compareAt: product.compareAt,
      image: product.image,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-[20px] border border-line bg-white p-3.5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover",
        className,
      )}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-[18px] border border-line bg-surface">
        <Link
          href={`/product/${product.slug}`}
          aria-label={product.title}
          className="absolute inset-0"
        >
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {product.badge ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-full bg-brand px-2.5 py-0.5 font-mono uppercase tracking-[0.12em] text-[11px] font-bold text-white shadow-soft">
            {product.badge}
          </span>
        ) : null}

        <motion.button
          type="button"
          whileTap={{ scale: 0.8 }}
          onClick={() => toggleWishlist(product)}
          aria-pressed={liked}
          aria-label={
            liked ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`
          }
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-brand shadow-soft transition-colors hover:bg-white"
        >
          <motion.span
            className="inline-flex"
            animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Icon name="favorite" filled={liked} className="text-[18px]" />
          </motion.span>
        </motion.button>
      </div>

      <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-section px-2 py-0.5 font-body text-[11px] font-semibold text-brand-dark">
          <Icon name="auto_fix_high" className="text-[13px]" />
          Customizable
        </span>
        {product.rating ? (
          <span className="inline-flex items-center gap-1 font-body text-[12px] font-semibold text-plum-muted">
            <Icon name="star" filled className="text-star text-[14px]" />
            {product.rating.toFixed(1)}
            {product.reviewCount ? (
              <span className="font-normal text-plum-muted/70">({product.reviewCount})</span>
            ) : null}
          </span>
        ) : null}
      </div>

      <h3 className="mb-0.5 line-clamp-1 font-body text-[16px] font-bold text-plum">
        <Link href={`/product/${product.slug}`} className="transition-colors hover:text-brand">
          {product.title}
        </Link>
      </h3>
      <p className="mb-2 line-clamp-1 font-body text-[13px] text-plum-muted">
        {product.description}
      </p>

      <div className="mb-3 mt-auto flex items-baseline gap-2">
        <span className="font-body text-[22px] font-bold leading-none text-brand-dark">
          {formatPrice(product.price)}
        </span>
        {product.compareAt > product.price ? (
          <span className="font-body text-[13px] leading-none text-plum-muted line-through">
            {formatPrice(product.compareAt)}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="ml-auto font-body text-[12px] font-bold text-brand">
            {discount}% OFF
          </span>
        ) : null}
      </div>

      <Button
        size="sm"
        onClick={handleAdd}
        aria-label={`Add ${product.title} to cart`}
        className="w-full"
      >
        <Icon name={added ? "check" : "shopping_bag"} className="text-[16px]" />
        {added ? "Added to Cart" : ctaLabel}
      </Button>
    </article>
  );
}
