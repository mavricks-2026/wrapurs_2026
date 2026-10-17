"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/config/content";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useWishlistStore } from "@/features/wishlist/useWishlistStore";
import { useMounted } from "@/hooks/useMounted";
import { cn, formatPrice } from "@/lib/utils";

/**
 * ProductCard — the arch-topped card used across the storefront.
 * Hover lift + image zoom + wishlist heart pop are all handled here.
 */
export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const mounted = useMounted();
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i.id === product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const liked = mounted && inWishlist;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[24px] border border-line bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-[3px] hover:shadow-cardHover",
        className,
      )}
    >
      <div className="relative mb-3 h-[190px] overflow-hidden rounded-b-[16px] rounded-t-[140px] border border-line bg-surface sm:h-[220px]">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
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

      <div className="mb-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold text-white">
          <Icon name="auto_fix_high" className="text-[13px]" />
          Customizable
        </span>
      </div>

      <h3 className="mb-1 line-clamp-1 font-body text-[17px] font-bold text-plum">
        {product.title}
      </h3>

      <div className="mb-4 flex items-baseline gap-2">
        <span className="font-body text-[24px] font-bold leading-none text-brand-dark">
          {formatPrice(product.price)}
        </span>
        {product.compareAt > product.price ? (
          <span className="font-body text-[14px] leading-none text-plum-muted line-through">
            {formatPrice(product.compareAt)}
          </span>
        ) : null}
      </div>

      <ButtonLink
        href={`/product/${product.slug}`}
        size="sm"
        className="mt-auto w-full py-2.5 text-[14px]"
      >
        Personalize Now
      </ButtonLink>
    </article>
  );
}
