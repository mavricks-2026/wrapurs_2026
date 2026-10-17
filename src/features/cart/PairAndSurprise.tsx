"use client";

import Link from "next/link";
import type { Product } from "@/config/catalog";
import { cartContent } from "@/config/cart";
import { ShopProductCard } from "@/features/shop";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";

/**
 * PairAndSurprise — the "You may also like" rail shown beneath the cart,
 * reusing the Shop product card so add-to-cart keeps working.
 */
export function PairAndSurprise({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Reveal>
            <p className="mb-1 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-brand">
              {cartContent.suggest.eyebrow}
            </p>
          </Reveal>
          <AnimatedText
            as="h2"
            text={`${cartContent.suggest.title} ${cartContent.suggest.titleHighlight}`}
            highlight={cartContent.suggest.titleHighlight}
            className="font-display text-[28px] leading-tight text-plum sm:text-[32px]"
          />
        </div>
        <Reveal delay={0.1}>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 font-body text-[14px] font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            {cartContent.suggest.link}
            <Icon
              name="arrow_forward"
              className="text-[18px] transition-transform group-hover:translate-x-1"
            />
          </Link>
        </Reveal>
      </div>

      <StaggerGroup className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <StaggerItem key={product.id} className="h-full">
            <ShopProductCard product={product} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
