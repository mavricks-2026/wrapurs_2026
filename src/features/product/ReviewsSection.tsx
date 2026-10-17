"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProductDetail } from "@/config/product-details";
import { AnimatedText, Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { Icon } from "@/components/ui/Icon";
import { StarRating } from "@/components/common/StarRating";
import { cn } from "@/lib/utils";

const SORTS = ["Most Helpful First", "Newest Reviews", "With Customer Photos"] as const;

/** Turn a "days ago" number into a friendly relative label. */
function relativeDate(daysAgo: number) {
  if (daysAgo <= 1) return "1 day ago";
  if (daysAgo < 14) return `${daysAgo} days ago`;
  const weeks = Math.round(daysAgo / 7);
  return weeks <= 1 ? "1 week ago" : `${weeks} weeks ago`;
}

/**
 * ReviewsSection — rating summary with distribution bars plus the customer
 * review list and sort toolbar.
 */
export function ReviewsSection({ detail }: { detail: ProductDetail }) {
  const [sort, setSort] = useState<(typeof SORTS)[number]>(SORTS[0]);
  const { rating, total, breakdown } = detail.reviewSummary;

  return (
    <section className="mt-14">
      <Reveal>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <AnimatedText
            as="h2"
            text="Customer Stories & Reviews"
            highlight="Reviews"
            className="font-display text-[26px] text-plum sm:text-[30px]"
          />
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-brand px-5 py-2.5 font-mono uppercase tracking-[0.12em] text-[12px] font-medium text-brand transition-colors hover:bg-section"
          >
            <Icon name="rate_review" className="text-[18px]" />
            Write a Review
          </button>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mb-5 flex flex-wrap gap-2">
          {SORTS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSort(label)}
              aria-pressed={sort === label}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-body text-[13px] font-semibold transition-colors",
                sort === label
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-plum-muted hover:border-brand hover:text-brand",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Summary */}
        <Reveal className="lg:col-span-4" from="left">
          <div className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <div className="flex items-end gap-2">
              <span className="font-display text-[46px] leading-none text-brand-dark">
                {rating.toFixed(1)}
              </span>
              <span className="pb-1 font-body text-[13px] text-plum-muted">out of 5.0</span>
            </div>
            <StarRating rating={rating} allowHalf className="mt-1.5" iconClassName="text-[20px]" />
            <p className="mt-2 font-body text-[13px] text-plum-muted">
              {total.toLocaleString("en-IN")} verified purchasers
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {breakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 font-body text-[12px] font-semibold text-plum-muted">
                    {row.stars} Star
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-section">
                    <motion.span
                      className="block h-full rounded-full bg-brand"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.percent}%` }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right font-body text-[12px] text-plum-muted">
                    {row.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Review list */}
        <div className="lg:col-span-8">
          <Reveal>
            <div className="mb-4 rounded-[16px] bg-section px-4 py-3">
              <p className="font-body text-[13px] font-bold text-brand-dark">
                Authentic Keepsake Reviews
              </p>
              <p className="font-body text-[12px] text-plum-muted">
                Every review corresponds to a verified customized production batch.
              </p>
            </div>
          </Reveal>

          <StaggerGroup className="flex flex-col gap-4">
            {detail.reviews.map((review) => (
              <StaggerItem key={review.title}>
                <article className="rounded-[20px] border border-line bg-white p-4 shadow-soft sm:p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <StarRating rating={review.rating} iconClassName="text-[16px]" />
                    <span className="inline-flex items-center gap-1 rounded-full bg-section px-2.5 py-0.5 font-body text-[11px] font-semibold text-brand-dark">
                      <Icon name="verified" filled className="text-[13px]" />
                      Verified Buyer
                    </span>
                    <span className="font-body text-[12px] text-plum-muted">
                      {relativeDate(review.daysAgo)}
                    </span>
                  </div>

                  <h3 className="font-body text-[15px] font-bold text-plum">{review.title}</h3>
                  <p className="mt-1 font-body text-[14px] leading-relaxed text-plum-muted">
                    {review.body}
                  </p>

                  {review.image ? (
                    <div className="relative mt-3 h-40 w-full max-w-xs overflow-hidden rounded-[16px] border border-line bg-surface">
                      <Image
                        src={review.image}
                        alt={`Photo shared by ${review.name}`}
                        fill
                        sizes="(max-width: 640px) 80vw, 320px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand font-mono uppercase tracking-[0.12em] text-[13px] font-bold text-white">
                      {review.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-body text-[13px] font-semibold text-plum">
                        {review.name}
                      </p>
                      <p className="font-body text-[12px] text-plum-muted">{review.location}</p>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
