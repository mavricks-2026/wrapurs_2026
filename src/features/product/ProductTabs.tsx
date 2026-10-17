"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductDetail, ProductTabId } from "@/config/product-details";
import { productTabs } from "@/config/product-details";
import { Reveal } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";
import { animationConfig } from "@/config/motion";
import { cn } from "@/lib/utils";

/**
 * ProductTabs — Story & Craft / Specifications / Care & Delivery tabbed panel
 * with a soft cross-fade between panels.
 */
export function ProductTabs({ detail, image }: { detail: ProductDetail; image: string }) {
  const [active, setActive] = useState<ProductTabId>("story");

  return (
    <section className="mt-14">
      <Reveal>
        <div
          role="tablist"
          aria-label="Product information"
          className="flex flex-wrap gap-2 rounded-[18px] border border-line bg-white p-2 shadow-soft"
        >
          {productTabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "relative flex-1 rounded-[12px] px-4 py-2.5 font-body text-[14px] font-semibold transition-colors sm:flex-none",
                  isActive ? "text-white" : "text-plum hover:text-brand",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="pdp-tab-pill"
                    className="absolute inset-0 z-0 rounded-[12px] bg-brand"
                    transition={{
                      duration: animationConfig.duration.fast,
                      ease: animationConfig.ease.out,
                    }}
                  />
                ) : null}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: animationConfig.duration.base, ease: animationConfig.ease.out }}
          >
            {active === "story" ? (
              <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                <div>
                  {detail.longDescription.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="mb-3 font-body text-[15px] leading-relaxed text-plum-muted last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {detail.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 font-body text-[14px] font-semibold text-plum"
                      >
                        <Icon
                          name="check_circle"
                          filled
                          className="mt-0.5 text-[18px] text-brand"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-line bg-surface">
                  <Image
                    src={image}
                    alt="Craft details"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ) : null}

            {active === "specs" ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                {detail.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-[16px] border border-line bg-white p-4 shadow-soft"
                  >
                    <dt className="mb-1 font-mono text-[12px] font-bold uppercase tracking-wide text-brand">
                      {spec.label}
                    </dt>
                    <dd className="font-body text-[14px] text-plum-muted">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {active === "care" ? (
              <ul className="grid gap-3">
                {detail.care.map((line, i) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 rounded-[16px] border border-line bg-white p-4 shadow-soft"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-section font-display text-[15px] text-brand-dark">
                      {i + 1}
                    </span>
                    <p className="font-body text-[14px] leading-relaxed text-plum-muted">
                      {line}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
