"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/config/catalog";
import { Reveal } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";
import { useCartStore } from "@/features/cart/useCartStore";
import { formatPrice } from "@/lib/utils";

/**
 * FrequentlyBought — "Frequently Bought Together" bundle: this product plus two
 * related keepsakes, with a combined bundle price and an "Add all 3" shortcut.
 */
export function FrequentlyBought({ product, related }: { product: Product; related: Product[] }) {
  const add = useCartStore((s) => s.add);
  const [added, setAdded] = useState(false);
  const items = [product, ...related].slice(0, 3);

  const totalPrice = items.reduce((sum, p) => sum + p.price, 0);
  const totalCompare = items.reduce((sum, p) => sum + p.compareAt, 0);
  const savings = Math.max(0, totalCompare - totalPrice);

  function addAll() {
    items.forEach((p) => {
      add({
        id: p.id,
        productId: p.id,
        slug: p.slug,
        title: p.title,
        price: p.price,
        compareAt: p.compareAt,
        image: p.image,
      });
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <section className="mt-14">
      <Reveal>
        <h2 className="mb-6 font-display text-[26px] text-plum sm:text-[30px]">
          Frequently Bought <span className="text-brand">Together</span>
        </h2>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex flex-col gap-5 rounded-[24px] border border-line bg-white p-4 shadow-soft sm:p-5 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {items.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                {i > 0 ? (
                  <span className="font-display text-[24px] leading-none text-brand">+</span>
                ) : null}
                <Link href={`/product/${p.slug}`} className="group flex w-[132px] flex-col gap-1.5">
                  <span className="relative aspect-square w-full overflow-hidden rounded-[16px] border border-line bg-surface">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="132px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="line-clamp-2 font-body text-[13px] font-semibold text-plum transition-colors group-hover:text-brand">
                    {p.title}
                  </span>
                  <span className="font-body text-[17px] font-bold leading-none text-brand-dark">
                    {formatPrice(p.price)}
                  </span>
                </Link>
              </div>
            ))}
            <span className="hidden font-display text-[24px] leading-none text-brand lg:inline">
              =
            </span>
          </div>

          <div className="flex flex-col gap-2 border-t border-line pt-4 lg:w-[280px] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <span className="font-body text-[13px] font-semibold text-plum-muted">
              Combined Bundle Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-body text-[28px] font-bold leading-none text-brand-dark">
                {formatPrice(totalPrice)}
              </span>
              {totalCompare > totalPrice ? (
                <span className="font-body text-[14px] leading-none text-plum-muted line-through">
                  {formatPrice(totalCompare)}
                </span>
              ) : null}
            </div>
            {savings > 0 ? (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-section px-2.5 py-1 font-body text-[12px] font-bold text-brand">
                <Icon name="savings" className="text-[14px]" />
                Save {formatPrice(savings)}
              </span>
            ) : null}
            <button
              type="button"
              onClick={addAll}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 font-mono uppercase tracking-[0.12em] text-[15px] font-semibold text-white shadow-soft transition-colors hover:bg-brand-dark"
            >
              <Icon name={added ? "check" : "add_shopping_cart"} className="text-[18px]" />
              {added ? "Added all 3 ✓" : "Add all 3 to Cart"}
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
