"use client";

import Image from "next/image";
import { AnimatedText, Reveal } from "@/components/motion";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { hero as defaultHero } from "@/config/content";
import type { SiteSettings } from "@/services/settings.service";

export function Hero({ settings }: { settings?: Partial<SiteSettings["hero"]> } = {}) {
  const content = {
    title: settings?.title || defaultHero.title,
    highlight: settings?.highlight || defaultHero.highlight,
    subtitle: settings?.subtitle || defaultHero.subtitle,
    primaryCta: {
      label: settings?.primaryCtaLabel || defaultHero.primaryCta.label,
      href: settings?.primaryCtaHref || defaultHero.primaryCta.href,
    },
    secondaryCta: {
      label: settings?.secondaryCtaLabel || defaultHero.secondaryCta.label,
      href: settings?.secondaryCtaHref || defaultHero.secondaryCta.href,
    },
    image: settings?.imageUrl || defaultHero.image,
  };

  return (
    <section className="relative overflow-hidden bg-surface pb-12 pt-12 sm:pt-14">
      {/* soft decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-brand/5 blur-3xl"
      />

      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Copy */}
          <div className="lg:col-span-6 lg:pr-4">
            <AnimatedText
              as="h1"
              text={content.title}
              highlight={content.highlight}
              delay={0.1}
              className="font-display text-[40px] leading-[1.12] tracking-tight text-plum sm:text-[52px] lg:text-[56px]"
            />

            <Reveal delay={0.25}>
              <p className="mt-5 max-w-lg font-body text-[18px] leading-[1.7] text-plum-muted">
                {content.subtitle}
              </p>
            </Reveal>

            <Reveal delay={0.35} className="mt-9 flex flex-wrap items-center gap-4">
              <ButtonLink href={content.primaryCta.href} size="lg">
                {content.primaryCta.label}
                <Icon name="arrow_forward" className="text-[20px]" />
              </ButtonLink>
              <ButtonLink href={content.secondaryCta.href} size="lg" variant="outline">
                {content.secondaryCta.label}
              </ButtonLink>
            </Reveal>
          </div>

          {/* Image (arch) */}
          <div className="lg:col-span-6 lg:flex lg:justify-end">
            <Reveal from="right" delay={0.2} className="relative w-full max-w-[490px]">
              <div className="rounded-t-[180px] rounded-b-[24px] border border-line bg-white p-3 shadow-card">
                <div className="relative h-[400px] overflow-hidden rounded-t-[170px] rounded-b-[18px] bg-section sm:h-[520px]">
                  <Image
                    src={content.image}
                    alt="Handcrafted personalized gift keepsake"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 490px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
