"use client";

import Link from "next/link";
import type { Product } from "@/config/catalog";
import { ShopProductCard } from "@/features/shop";
import { Breadcrumbs } from "@/components/layout/WhatsAppButton";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { selectWishlistCount, useWishlistStore } from "./useWishlistStore";
import { useMounted } from "@/hooks/useMounted";

/**
 * WishlistView — the /wishlist page. Reads the persisted wishlist store (the
 * same one the heart-pop micro-interaction writes to) and shows the saved
 * keepsakes, or a friendly empty state with suggestions.
 */
export function WishlistView({ suggested }: { suggested: Product[] }) {
  const mounted = useMounted();
  const items = useWishlistStore((s) => s.items);
  const clear = useWishlistStore((s) => s.clear);
  const count = useWishlistStore(selectWishlistCount);

  // Persisted store fills in after mount — avoid a hydration mismatch.
  if (!mounted) {
    return (
      <div className="w-full bg-surface">
        <Container className="flex flex-col gap-8 py-8">
          <div className="h-5 w-40 animate-pulse rounded-full bg-line/60" />
          <div className="h-10 w-64 animate-pulse rounded-full bg-line/60" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-[20px] border border-line bg-white/70"
              />
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col gap-8 py-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Reveal>
              <p className="mb-1 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-brand">
                Saved Keepsakes
              </p>
            </Reveal>
            <AnimatedText
              as="h1"
              text={`Your Wishlist (${count})`}
              highlight="Wishlist"
              onView={false}
              className="font-display text-[32px] leading-tight text-plum sm:text-[40px]"
            />
          </div>

          {items.length ? (
            <Reveal delay={0.1}>
              <button
                type="button"
                onClick={clear}
                className="font-body text-[14px] font-semibold text-plum-muted transition-colors hover:text-brand-dark"
              >
                Clear all
              </button>
            </Reveal>
          ) : null}
        </div>

        {items.length ? (
          <StaggerGroup className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => (
              <StaggerItem key={product.id} className="h-full">
                <ShopProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <section className="relative overflow-hidden rounded-[24px] border border-line bg-white px-6 py-14 text-center shadow-soft">
            <Reveal className="flex flex-col items-center">
              <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-section text-brand shadow-soft">
                <Icon name="favorite" className="text-[40px]" />
              </span>
              <h2 className="font-display text-[30px] leading-tight text-plum">
                Your Wishlist is Empty
              </h2>
              <p className="mx-auto mt-3 max-w-lg font-body text-[15px] leading-relaxed text-plum-muted">
                Tap the heart on any keepsake to save it here for later — perfect for building a
                shortlist before a birthday or anniversary.
              </p>
              <ButtonLink href="/shop" size="lg" className="mt-6">
                Explore the Shop
                <Icon name="arrow_forward" className="text-[20px]" />
              </ButtonLink>
            </Reveal>
          </section>
        )}

        {suggested.length ? (
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <AnimatedText
                as="h2"
                text="Most Loved Keepsakes"
                highlight="Loved"
                className="font-display text-[28px] leading-tight text-plum sm:text-[32px]"
              />
              <Reveal delay={0.1}>
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-1.5 font-body text-[14px] font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  View full catalog
                  <Icon
                    name="arrow_forward"
                    className="text-[18px] transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </Reveal>
            </div>

            <StaggerGroup className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {suggested.map((product) => (
                <StaggerItem key={product.id} className="h-full">
                  <ShopProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </section>
        ) : null}
      </Container>
    </div>
  );
}
