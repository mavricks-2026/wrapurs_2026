"use client";

import { AnimatedText, Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumbs } from "@/components/layout/WhatsAppButton";
import { trustBadges } from "@/config/content";
import { StaggerGroup, StaggerItem } from "@/components/motion";

/**
 * PagePlaceholder — a friendly, on-brand stub for routes that are scheduled
 * for a later milestone. Keeps every link from the Home page working.
 * Each of these files gets replaced by its real implementation in M3–M8.
 */
export function PagePlaceholder({
  title,
  highlight,
  eyebrow,
  description,
  milestone,
  icon = "auto_awesome",
  breadcrumbs = [],
  ctaHref = "/shop",
  ctaLabel = "Explore the Shop",
}: {
  title: string;
  highlight?: string;
  eyebrow?: string;
  description: string;
  milestone: string;
  icon?: string;
  breadcrumbs?: { label: string; href?: string }[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="bg-surface py-12 sm:py-16">
      <Container>
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, ...breadcrumbs]} />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-white text-brand shadow-soft">
              <Icon name={icon} className="text-[32px]" />
            </span>
          </Reveal>

          {eyebrow ? (
            <Reveal>
              <span className="mb-3 inline-block rounded-full border border-line bg-white px-3.5 py-1 font-mono text-[12px] font-semibold uppercase tracking-wider text-brand">
                {eyebrow}
              </span>
            </Reveal>
          ) : null}

          <AnimatedText
            as="h1"
            text={title}
            highlight={highlight}
            onView={false}
            className="font-display text-[36px] leading-tight text-plum sm:text-[44px] lg:text-[48px]"
          />

          <Reveal delay={0.2}>
            <p className="mx-auto mt-4 max-w-xl font-body text-[16px] leading-relaxed text-plum-muted">
              {description}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-section px-4 py-1.5 font-body text-[13px] font-semibold text-brand-dark">
              <Icon name="schedule" className="text-[16px]" />
              Coming in {milestone}
            </span>
          </Reveal>

          <Reveal delay={0.4} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href={ctaHref} size="lg">
              {ctaLabel}
              <Icon name="arrow_forward" className="text-[20px]" />
            </ButtonLink>
            <ButtonLink href="/" size="lg" variant="outline">
              Back home
            </ButtonLink>
          </Reveal>
        </div>

        <StaggerGroup className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {trustBadges.map((badge) => (
            <StaggerItem key={badge.label}>
              <div className="flex items-center justify-center gap-2.5 rounded-[18px] border border-line bg-white px-4 py-3.5 shadow-soft">
                <Icon name={badge.icon} className="text-[20px] text-brand" />
                <span className="font-body text-[14px] font-semibold text-plum">
                  {badge.label}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
