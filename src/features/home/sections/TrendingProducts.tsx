"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/common/ProductCard";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import type { Product } from "@/config/catalog";
import { trendingSection } from "@/config/content";
import { Icon } from "@/components/ui/Icon";

/**
 * TrendingProducts — the Home "Trending Now" rail. The product list is supplied
 * by the server page (static featured items first, then featured database
 * products) so the rail can include admin-created keepsakes without any client
 * data fetching.
 */
export function TrendingProducts({ products }: { products: Product[] }) {
  const visible = products.slice(0, trendingSection.visibleCount);

  return (
    <section className="py-16">
      <Container>
        <div className="mb-12 text-center">
          <AnimatedText
            as="h2"
            text={trendingSection.title}
            highlight={trendingSection.highlight}
            className="font-display text-[32px] leading-tight text-plum sm:text-[38px] lg:text-[42px]"
          />
          <Reveal delay={0.15}>
            <p className="mt-1 font-body text-[16px] text-plum-muted">
              {trendingSection.subtitle}
            </p>
          </Reveal>
        </div>

        <StaggerGroup className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {visible.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal delay={0.1} className="mt-12 flex flex-col items-center gap-3">
          <Button size="lg">
            {trendingSection.loadMoreLabel}
            <Icon name="expand_more" className="text-[20px]" />
          </Button>
          <Link
            href={trendingSection.viewAll.href}
            className="inline-flex items-center gap-1 font-body text-[15px] font-semibold text-brand-dark underline transition-colors hover:text-brand"
          >
            {trendingSection.viewAll.label}
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
