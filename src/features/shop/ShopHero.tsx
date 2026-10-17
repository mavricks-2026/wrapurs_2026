"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { AnimatedText, Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

type Stat = { icon: string; label: string };

/**
 * ShopHero — the rounded banner at the top of Shop / Collections / Search.
 * Headline + stats reveal in; the arch image slides in from the right.
 */
export function ShopHero({
  title,
  highlight,
  subtitle,
  stats = [],
  image,
  imageBadge,
  children,
}: {
  title: string;
  highlight?: string;
  subtitle: string;
  stats?: Stat[];
  image?: string;
  imageBadge?: string;
  /** Optional extra content rendered under the subtitle (e.g. a search form) */
  children?: ReactNode;
}) {
  return (
    <section className="pt-6 sm:pt-8">
      <Container>
        <div className="relative overflow-hidden rounded-[24px] bg-section px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          {/* decorative glow */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
            <div className={cn("flex-1 text-center", image && "lg:text-left")}>
              <AnimatedText
                as="h1"
                text={title}
                highlight={highlight}
                onView={false}
                className="font-display text-[38px] leading-tight text-plum sm:text-[48px] lg:text-[54px]"
              />

              <Reveal delay={0.2}>
                <p className="mx-auto mt-3 max-w-xl font-body text-[16px] leading-relaxed text-plum-muted lg:mx-0">
                  {subtitle}
                </p>
              </Reveal>

              {stats.length ? (
                <Reveal
                  delay={0.3}
                  className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                >
                  {stats.map((stat) => (
                    <span
                      key={stat.label}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-body text-[14px] font-semibold text-brand-dark shadow-soft"
                    >
                      <Icon name={stat.icon} className="text-[18px] text-brand" />
                      {stat.label}
                    </span>
                  ))}
                </Reveal>
              ) : null}

              {children ? (
                <Reveal delay={0.35} className="mt-6">
                  {children}
                </Reveal>
              ) : null}
            </div>

            {image ? (
              <Reveal from="right" delay={0.25} className="relative w-full max-w-[280px] shrink-0">
                <div className="relative h-[300px] w-full overflow-hidden rounded-b-[24px] rounded-t-[150px] border border-line bg-white shadow-card sm:h-[340px]">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 60vw, 280px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-plum/45 via-transparent to-transparent" />
                  {imageBadge ? (
                    <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 px-3.5 py-1.5 font-body text-[12px] font-bold text-brand-dark shadow-soft">
                      {imageBadge}
                    </span>
                  ) : null}
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
