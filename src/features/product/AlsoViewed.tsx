"use client";

import Link from "next/link";
import type { Product } from "@/config/catalog";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";
import { ShopProductCard } from "@/features/shop/ShopProductCard";

/**
 * AlsoViewed — "Customers Also Viewed" grid of related keepsakes.
 */
export function AlsoViewed({
  related,
  collectionHref = "/shop",
  collectionLabel = "Explore collection",
}: {
  related: Product[];
  collectionHref?: string;
  collectionLabel?: string;
}) {
  if (!related.length) return null;

  return (
    <section className="mt-14">
      <Reveal>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <AnimatedText
            as="h2"
            text="Customers Also Viewed"
            highlight="Also"
            className="font-display text-[26px] text-plum sm:text-[30px]"
          />
          <Link
            href={collectionHref}
            className="inline-flex w-fit items-center gap-1 font-body text-[14px] font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            {collectionLabel}
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        </div>
      </Reveal>

      <StaggerGroup className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {related.map((product) => (
          <StaggerItem key={product.id}>
            <ShopProductCard product={product} ctaLabel="Personalize Now" />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
