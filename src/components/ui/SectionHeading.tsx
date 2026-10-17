"use client";

import { AnimatedText } from "@/components/motion";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

/**
 * SectionHeading — animated section header (optional eyebrow + title + subtitle).
 * Used by every section so headings reveal consistently.
 * The eyebrow mirrors the maison-rouge mono/uppercase label treatment.
 */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  className,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal>
          <span
            className={cn(
              "mb-4 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-brand",
              align === "center" && "justify-center",
            )}
          >
            <span className="h-px w-6 bg-brand/60" aria-hidden="true" />
            {eyebrow}
            {align === "center" ? (
              <span className="h-px w-6 bg-brand/60" aria-hidden="true" />
            ) : null}
          </span>
        </Reveal>
      ) : null}
      <AnimatedText
        as="h2"
        text={title}
        highlight={highlight}
        className="font-display text-[34px] font-semibold leading-tight text-plum sm:text-[40px] lg:text-[46px]"
      />
      {subtitle ? (
        <Reveal delay={0.15}>
          <p
            className={cn(
              "mt-3 font-body text-[16px] leading-relaxed text-plum-muted",
              align === "center" && "mx-auto max-w-2xl",
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
