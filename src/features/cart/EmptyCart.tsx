"use client";

import Link from "next/link";
import type { Product } from "@/config/catalog";
import { cartContent, emptyCartCategories } from "@/config/cart";
import { ShopProductCard } from "@/features/shop";
import { Breadcrumbs } from "@/components/layout/WhatsAppButton";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { useWishlistStore, selectWishlistCount } from "@/features/wishlist/useWishlistStore";
import { useMounted } from "@/hooks/useMounted";
import { CheckoutStepper } from "./CheckoutStepper";

/**
 * EmptyCart — the illustrated empty-bag state: hero, bespoke category tiles and
 * a "Trending Keepsakes" rail to send shoppers back into the catalogue.
 */
export function EmptyCart({ trending }: { trending: Product[] }) {
  const mounted = useMounted();
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const count = mounted ? wishlistCount : 0;

  return (
    <div className="w-full bg-surface">
      <Container className="flex flex-col gap-10 py-8">
        {/* Breadcrumb + progress */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-center">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shopping Bag" }]} />
          <CheckoutStepper current={1} markCurrentDone={false} />
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[24px] border border-line bg-white px-6 py-14 text-center shadow-soft">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-brand/10 blur-3xl"
          />

          <Reveal className="relative flex flex-col items-center">
            <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-section text-brand shadow-soft">
              <Icon name="shopping_bag" className="text-[40px]" />
            </span>
          </Reveal>

          <AnimatedText
            as="h1"
            text="Your Cart is Empty"
            highlight="Empty"
            className="relative font-display text-[34px] leading-tight text-plum sm:text-[42px]"
          />

          <Reveal delay={0.15} className="relative">
            <p className="mx-auto mt-3 max-w-xl font-body text-[15px] leading-relaxed text-plum-muted">
              {cartContent.empty.description}
            </p>
          </Reveal>

          <Reveal delay={0.25} className="relative">
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/shop" size="lg">
                {cartContent.empty.ctaPrimary}
                <Icon name="arrow_forward" className="text-[20px]" />
              </ButtonLink>
              <ButtonLink href="/wishlist" variant="outline" size="lg">
                <Icon name="favorite" className="text-[20px]" />
                {cartContent.empty.ctaWishlist} ({count})
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.35} className="relative">
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {cartContent.empty.badges.map((badge) => (
                <span
                  key={badge.label}
                  className="flex items-center gap-2 font-body text-[14px] font-semibold text-plum-muted"
                >
                  <Icon name={badge.icon} filled className="text-[22px] text-brand" />
                  {badge.label}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Bespoke categories */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <Reveal>
              <p className="mb-1 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-brand">
                {cartContent.empty.categoriesEyebrow}
              </p>
            </Reveal>
            <AnimatedText
              as="h2"
              text={cartContent.empty.categoriesTitle}
              highlight="beloved keepsakes"
              className="font-display text-[28px] leading-tight text-plum sm:text-[32px]"
            />
            <Reveal delay={0.15}>
              <p className="mx-auto mt-2 max-w-lg font-body text-[15px] text-plum-muted">
                {cartContent.empty.categoriesSubtitle}
              </p>
            </Reveal>
          </div>

          <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {emptyCartCategories.map((category) => (
              <StaggerItem key={category.title} className="h-full">
                <Link
                  href={category.href}
                  className="group flex h-full flex-col items-center gap-2 rounded-[20px] border border-line bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-section text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon name={category.icon} className="text-[28px]" />
                  </span>
                  <h3 className="font-body text-[16px] font-bold text-plum">{category.title}</h3>
                  <p className="font-body text-[13px] text-plum-muted">{category.subtitle}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        {/* Trending keepsakes */}
        {trending.length ? (
          <section className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Reveal>
                  <p className="mb-1 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-brand">
                    {cartContent.empty.trendingEyebrow}
                  </p>
                </Reveal>
                <AnimatedText
                  as="h2"
                  text={cartContent.empty.trendingTitle}
                  highlight="cherished"
                  className="font-display text-[28px] leading-tight text-plum sm:text-[32px]"
                />
              </div>
              <Reveal delay={0.1}>
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-1.5 font-body text-[14px] font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  <span className="hidden sm:inline">{cartContent.empty.trendingLink}</span>
                  <span className="sm:hidden">{cartContent.empty.trendingLinkMobile}</span>
                  <Icon
                    name="arrow_forward"
                    className="text-[18px] transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </Reveal>
            </div>

            <StaggerGroup className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {trending.map((product) => (
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
